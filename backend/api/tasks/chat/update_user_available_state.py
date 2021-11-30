from datetime import datetime

from django.utils import timezone

from backend.api.models import Property, User
from backend.celery_app import app


@app.task
def schedule_user_available_state_update():
    for property in Property.objects.filter(is_released=True):
        today = timezone.now().astimezone(property.timezone)
        hours = property.business_hours.filter(weekday=today.weekday()).first()
        if not hours.is_workday:
            continue
        start_time = datetime.combine(today.date(), hours.start_time).astimezone(tz=property.timezone)
        end_time = datetime.combine(today.date(), hours.end_time).astimezone(tz=property.timezone)
        set_user_available_state.apply_async((property.pk, True), eta=start_time)
        set_user_available_state.apply_async((property.pk, False), eta=end_time)


@app.task
def set_user_available_state(property_id, is_available):
    # property = Property.objects.filter(id=property_id).first()
    # for user in property.users.all():
    #     user.is_available = is_available
    #     user.save()
    return


@app.task
def set_user_available_state_by_static_time(is_available):
    User.objects.update(is_available=is_available)
