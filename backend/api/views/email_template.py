from django.conf import settings

from backend.api.models import EmailTemplate
from backend.api.permissions import LeadLevelAccessAuthorized
from backend.api.serializer import EmailTemplateSerializer
from backend.api.views import PropertyLevelViewSet
from backend.api.tasks import send_email_template_activity_email
from backend.api.views.pagination import CustomResultsSetPagination


class EmailTemplateView(PropertyLevelViewSet):
    serializer_class = EmailTemplateSerializer
    permission_classes = [
        LeadLevelAccessAuthorized
    ]
    queryset = EmailTemplate.objects.all()
    pagination_class = CustomResultsSetPagination

    def perform_create(self, serializer):
        super(EmailTemplateView, self).perform_create(serializer)
        self.send_emails('created', serializer.instance)

    def perform_update(self, serializer):
        super(EmailTemplateView, self).perform_update(serializer)
        self.send_emails('edited', serializer.instance)

    def perform_destroy(self, instance):
        self.send_emails('deleted', instance)
        super(EmailTemplateView, self).perform_destroy(instance)

    def send_emails(self, action, template):
        property = template.property
        template_url = f'{settings.CRM_HOST}/{property.external_id}/settings/template/edit/{template.pk}'
        user_name = self.request.user.name
        subject = f'{user_name} {action} email template {template.name}'
        body = f'Property team member {user_name} {action} email template {template.name} for {property.name}. '
        if action == 'edited':
            body += f'Click here to view the edited template - ' \
                    f'<a href="{template_url}" target="_blank">{template.name}</a>.'
        if action == 'created':
            body += f'Click here to view the new template - ' \
                    f'<a href="{template_url}" target="_blank">{template.name}</a>.'
        send_email_template_activity_email.delay(property.pk, subject, body)
