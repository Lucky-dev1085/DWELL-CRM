import pytz
from datetime import datetime

from django.core import serializers
from django.utils.dateparse import parse_date
from django.utils import timezone
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from backend.api.models import Call, Property, User, ScoredCall, Report
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import ScoredCallSerializer
from backend.api.views import PropertyLevelViewSet
from backend.api.views.reports import get_date_range, calculate_overall_data
from backend.api.views.reports.report_utils import simple_divider
from backend.api.views.pagination import CustomResultsSetPagination

TZ = pytz.timezone('America/Phoenix')


class ScoredCallView(PropertyLevelViewSet):
    serializer_class = ScoredCallSerializer
    permission_classes = [DwellAuthorized]
    pagination_class = CustomResultsSetPagination

    def get_queryset(self):
        current_property = self.request.property
        current_user = self.request.user
        if current_property == 'call-rescores':
            return ScoredCall.objects.filter(rescore_status__in=['REQUIRED', 'RESCORED'])
        if self.action == 'require_rescore':
            return ScoredCall.objects.filter(property=current_property)
        return ScoredCall.objects.filter(property=current_property, call_scorer=current_user)

    def perform_create(self, serializer):
        serializer.save(property=self.request.property, call_scorer=self.request.user, scored_at=timezone.now())

    def perform_update(self, serializer):
        serializer.save(call_scorer=self.request.user, scored_at=timezone.now())

    @action(methods=['GET'], detail=False, authentication_classes=[SessionAuthentication],
            permission_classes=[IsAuthenticated])
    def callers(self, request, **kwargs):
        date = parse_date(request.query_params.get('date'))
        property = Property.objects.filter(id=request.query_params.get('property')).first()
        start = property.timezone.localize(datetime.combine(date, datetime.min.time()))
        end = property.timezone.localize(datetime.combine(date, datetime.max.time()))
        json_data = serializers.serialize('json',
                                          list(Call.objects.filter(property=property, date__range=(start, end))),
                                          fields=('prospect_phone_number',))
        return Response(json_data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False, authentication_classes=[SessionAuthentication],
            permission_classes=[IsAuthenticated])
    def call_scorers(self, request, **kwargs):
        property = Property.objects.filter(id=request.query_params.get('property')).first()
        json_data = serializers.serialize('json', list(User.objects.filter(properties__in=[property])),
                                          fields=('email',))
        return Response(json_data, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def require_rescore(self, request, **kwargs):
        scored_call = self.get_object()
        params = request.data

        scored_call.rescore_status = 'REQUIRED'
        scored_call.prev_score = scored_call.score
        scored_call.rescore_reason = params.get('reason')
        scored_call.save()

        property = scored_call.property
        property.is_call_rescore_required_today = True
        property.save()

        reports = Report.objects.filter(
            property=property, call_score__contains=[{'call': scored_call.call.pk}]
        )
        for report in reports:
            report.call_score = [i for i in report.call_score if i.get('call') != scored_call.call.pk]
            report.introduction_score = [i for i in report.introduction_score if i.get('call') != scored_call.call.pk]
            report.qualifying_score = [i for i in report.qualifying_score if i.get('call') != scored_call.call.pk]
            report.amenities_score = [i for i in report.amenities_score if i.get('call') != scored_call.call.pk]
            report.closing_score = [i for i in report.closing_score if i.get('call') != scored_call.call.pk]
            report.overall_score = [i for i in report.overall_score if i.get('call') != scored_call.call.pk]

            agent_scores = []
            for agent_score in report.agents_call_score:
                filtered = [i for i in agent_score.get('scores', []) if i.get('call') != scored_call.call.pk]
                if len(filtered) != len(agent_score.get('scores', [])):
                    score_sum = sum([item['score'] for item in filtered])
                    if not score_sum:
                        continue
                    score_len = len(filtered)
                    agent_scores.append(dict(
                        agent=agent_score.get('agent'),
                        score=simple_divider(score_sum, score_len),
                        scores=filtered
                    ))
                    continue
                agent_scores.append(agent_score)
            report.agents_call_score = agent_scores
            report.save()

        date_range = get_date_range(params.get('date_period'), params.get('custom_date_start'),
                                    params.get('custom_date_end'))
        reports = Report.objects.filter(property=property, date__gte=date_range[0].astimezone(tz=TZ).date(),
                                        date__lte=date_range[1].astimezone(tz=TZ).date()).values()
        calls_report = calculate_overall_data('calls_report', reports)
        serialized_data = ScoredCallSerializer(scored_call).data
        serialized_data['calls_report'] = calls_report

        from backend.api.views.reports import get_chart_values
        serialized_data['chart_values'] = get_chart_values(
            'overview_reports', params.get('date_period'), Property.objects.filter(id=property.id),
            date_range
        ).get('average_call_score')

        return Response(serialized_data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False)
    def rescore_calls_meta(self, request, **kwargs):
        start_time = TZ.localize(
            datetime.combine(timezone.now().astimezone(tz=TZ).date(), datetime.min.time())
        )
        end_time = TZ.localize(
            datetime.combine(timezone.now().astimezone(tz=TZ).date(), datetime.max.time())
        )

        has_call_rescored_today = ScoredCall.objects.filter(
            rescore_status='RESCORED', scored_at__gte=start_time, scored_at__lte=end_time
        ).count() and not ScoredCall.objects.filter(rescore_status='REQUIRED').count()
        required_call_rescores_count = ScoredCall.objects.filter(rescore_status='REQUIRED').count()

        return Response(dict(required_call_rescores_count=required_call_rescores_count,
                             has_scored_calls_today=has_call_rescored_today), status=status.HTTP_200_OK)
