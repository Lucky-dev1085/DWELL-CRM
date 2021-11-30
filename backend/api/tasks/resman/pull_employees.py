from backend.api.models import Property
from backend.celery_app import app
from backend.api.models import ResManEmployee
from .utils import get_employees


@app.task
def pull_res_man_employees(pk=None):
    """
    Pull floor plans / units from ResMan.
    :param pk: property pk
    :return:
    """
    try:
        if pk:
            properties = [Property.objects.get(pk=pk)]
        else:
            properties = Property.objects.filter(is_released=True).exclude(resman_property_id=None) \
                .exclude(resman_property_id='')
    except Property.DoesNotExist:
        return
    for property in properties:
        employees = get_employees(property)
        if not employees:
            continue
        external_ids = [employee.get('ID') for employee in employees]
        ResManEmployee.objects.filter(property=property).exclude(external_id__in=external_ids).delete()
        for employee in employees:
            try:
                ResManEmployee.objects.update_or_create(external_id=employee.get('ID'), email=employee.get('Email'),
                                                        property=property, name=employee.get('Name'))
            except:
                pass
