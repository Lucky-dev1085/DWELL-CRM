from datetime import timedelta, datetime

import pytz
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from backend.api import views
from backend.api.models import DemoTour
from backend.api.permissions import DemoTourAuthorized
from backend.api.serializer import DemoTourSerializer
from backend.api.utils import is_holiday, get_demo_available_times


class DemoTourView(views.BaseViewSet):
    serializer_class = DemoTourSerializer
    permission_classes = [DemoTourAuthorized]
    queryset = DemoTour.objects.all()

    def get_object(self):
        return get_object_or_404(DemoTour.objects.all(), external_id=self.kwargs.get('pk'))

    @action(methods=['GET'], detail=False, permission_classes=[DemoTourAuthorized])
    def available_dates(self, request, **kwargs):
        dates = []
        today = timezone.now().astimezone(tz=pytz.timezone('US/Central')).date()
        cnt = 1
        while len(dates) < 5:
            date = today + timedelta(days=cnt)
            times = get_demo_available_times(date)
            if date.weekday() < 5 and not is_holiday(date) and len(times) > 0:
                dates.append(date)
            cnt += 1
        return Response(dates, status=200)

    @action(methods=['GET'], detail=False, permission_classes=[DemoTourAuthorized])
    def available_time_slots(self, request, **kwargs):
        date = request.query_params.get('date')
        current_demo = request.query_params.get('demo')

        current_timezone = pytz.timezone('US/Central')
        date = datetime.strptime(date, '%Y-%m-%d')
        times = get_demo_available_times(date, current_timezone, current_demo)
        return Response(times, status=200)
