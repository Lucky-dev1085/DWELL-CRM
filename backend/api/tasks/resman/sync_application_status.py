from backend.api.models import Property
from backend.celery_app import app
from backend.api.tasks.resman.utils import check_application_status, pull_applications
from backend.api.tasks.nylas.email_auto_sequences import send_complete_application_reminder_email


@app.task()
def sync_application_status():
    """
    This task pull the application status
    This method could be run in two places one is called by celery beat scheduling workflow, and the other is when
    property is updated.
    :return:
    """
    for property in Property.objects.filter(is_released=True).exclude(resman_property_id=None) \
            .exclude(resman_property_id=''):
        # we pull the applications on property basis
        people = pull_applications(property)
        # iterate the leads of current property which has resman person id
        for lead in property.leads.exclude(resman_person_id__isnull=True).exclude(resman_person_id__exact='').exclude(
                application_complete_email_sent=True):
            # check application status with given resman data
            submitted = check_application_status(lead, people)
            if submitted:
                send_complete_application_reminder_email(lead)
