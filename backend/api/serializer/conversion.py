from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from rest_framework import serializers

from backend.api.models import Conversion, ProspectSource, ChatProspect
from backend.api.tasks import send_guest_card_email, send_guest_card_emails_without_nylas
from backend.api.utils import dedupe_lead


class ConversionSerializer(serializers.ModelSerializer):
    property = serializers.CharField(source='property.name', read_only=True)

    def create(self, validated_data):
        instance = super(ConversionSerializer, self).create(validated_data)
        if not instance.current_resident and instance.type != Conversion.PHONE_CALL and \
                instance.property.platform == 'BOTH':

            condition = Q(first_name=instance.first_name, last_name=instance.last_name)
            if instance.email:
                condition |= Q(email=instance.email)
            if instance.phone_number:
                condition |= Q(phone_number=instance.phone_number)

            source = ProspectSource.objects.filter(name='Standalone Website', property=instance.property).first()

            lead_details = dict(
                first_name=instance.first_name,
                last_name=instance.last_name,
                phone_number=instance.phone_number,
                email=instance.email,
                origin='WEB',
                source=source,
                beds=self.initial_data.get('beds'),
                baths=self.initial_data.get('baths')
            )

            plan = instance.property.floor_plans.filter(plan__iexact=self.initial_data.get('plan')).first()
            lead, _ = dedupe_lead(instance.property, **lead_details)
            if plan:
                lead.floor_plan.add(plan)

            instance.lead = lead
            instance.save()

            if lead.email_messages.filter(
                    is_guest_card_email=True, date__gte=timezone.now() - timedelta(days=1)
            ).count() == 0:
                if not instance.property.nylas_access_token:
                    send_guest_card_emails_without_nylas.apply_async((lead.pk,), countdown=60 * 15)
                else:
                    send_guest_card_email.apply_async((lead.pk,), countdown=60 * 15)

            prospect = ChatProspect.objects.filter(
                property=instance.property,
                external_id=self.initial_data.get('prospect_uuid')
            ).first()

            if prospect and not prospect.lead:
                prospect.lead = lead
                prospect.conversion = instance
                prospect.save()
        return instance

    class Meta:
        model = Conversion
        fields = '__all__'
