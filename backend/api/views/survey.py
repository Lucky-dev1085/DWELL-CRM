import datetime

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from backend.api.models import Survey
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import SurveySerializer
from backend.api.views import PropertyLevelViewSet
from backend.api.views.pagination import CustomResultsSetPagination


class SurveyView(PropertyLevelViewSet):
    serializer_class = SurveySerializer
    permission_classes = [DwellAuthorized]
    pagination_class = CustomResultsSetPagination

    def get_queryset(self):
        queryset = Survey.objects.filter(property=self.request.property)
        if self.request.query_params.get('competitor_id'):
            queryset = queryset.filter(competitor=self.request.query_params.get('competitor_id'))
        return queryset

    @action(methods=['POST'], detail=False)
    def update_surveys(self, request, **kwargs):
        date = request.data.get('date')
        updated_surveys = request.data.get('updated_surveys', [])
        created_surveys = request.data.get('created_surveys', [])
        deleted_surveys = request.data.get('deleted_surveys', [])
        if updated_surveys:
            for survey in updated_surveys:
                serializer = SurveySerializer(data=survey)
                if serializer.is_valid():
                    Survey.objects.filter(id=survey['id']).update(
                        unit_type=survey['unit_type'], unit_type_name=survey['unit_type_name'],
                        unit_class=survey['unit_class'], market_rent=survey['market_rent'],
                        effective_rent=survey['effective_rent'], concession_amount=survey['concession_amount'])
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if created_surveys:
            month = datetime.datetime.strptime(date, '%Y-%m-%d').month
            year = datetime.datetime.strptime(date, '%Y-%m-%d').year
            for survey in created_surveys:
                serializer = SurveySerializer(data=survey)
                if serializer.is_valid():
                    first_surveys = Survey.objects.filter(
                        is_first=True, property=self.request.property, competitor_id=survey['competitor'])
                    Survey.objects.create(
                        unit_type=survey['unit_type'], unit_type_name=survey['unit_type_name'],
                        unit_class=survey['unit_class'], market_rent=survey['market_rent'],
                        effective_rent=survey['effective_rent'], concession_amount=survey['concession_amount'],
                        competitor_id=survey['competitor'], property=self.request.property,
                        date=datetime.datetime.strptime(date, '%Y-%m-%d').date(),
                        is_first=not first_surveys.exists() or first_surveys.filter(
                            date__month=month, date__year=year).exists())
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if deleted_surveys:
            Survey.objects.filter(id__in=deleted_surveys).delete()

        response_survey = SurveySerializer(self.get_queryset(), many=True)
        return Response(response_survey.data, status=200)
