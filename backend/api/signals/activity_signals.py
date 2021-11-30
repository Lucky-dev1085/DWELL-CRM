import logging
from datetime import datetime
from django.utils import timezone

from django.db.models.signals import post_save, pre_save, pre_delete
from django.dispatch import receiver

from backend.api.models import Lead, Activity, Task, Note, EmailMessage, Roommate, ChatProspect, SMSContent

logging.getLogger().setLevel(logging.INFO)


@receiver(post_save, sender=Roommate)
def roommate_create_activity(sender, instance, created, **kwargs):
    if created:
        Activity.objects.create(property=instance.property, lead=instance.lead, type=Activity.ROOMMATE_CREATED,
                                content='{} {}'.format(instance.first_name, instance.last_name), object=instance)


@receiver(pre_save, sender=Roommate)
def roommate_update_activity(sender, instance, **kwargs):
    roommate = Roommate.objects.filter(id=instance.id).first()
    if roommate:
        Activity.objects.create(property=instance.property, lead=instance.lead, type=Activity.ROOMMATE_UPDATED,
                                content='{} {}'.format(instance.first_name, instance.last_name), object=instance)


@receiver(pre_delete, sender=Roommate)
def roommate_delete_activity(sender, instance, **kwargs):
    Activity.objects.create(property=instance.property, lead=instance.lead, type=Activity.ROOMMATE_DELETED,
                            content='{} {}'.format(instance.first_name, instance.last_name), object=instance)


@receiver(post_save, sender=Lead)
def lead_create_activity(sender, instance, created, **kwargs):
    if created:
        Activity.objects.create(property=instance.property, lead=instance, type=Activity.LEAD_CREATED,
                                content='{} {}'.format(instance.first_name, instance.last_name),
                                creator=instance.actor)


@receiver(post_save, sender=Task)
def task_create_activity(sender, instance, created, **kwargs):
    if created:
        if instance.type in Task.TOUR_TYPES.keys():
            task_type = Activity.TOUR_CREATED
        else:
            task_type = Activity.TASK_CREATED
        Activity.objects.create(property=instance.property, lead=instance.lead, type=task_type,
                                content=instance.title, creator=instance.actor,
                                object=instance)


@receiver(pre_save, sender=Task)
def task_update_activity(sender, instance, **kwargs):
    task = instance
    if instance.pk:
        old_task = Task.objects.filter(pk=task.pk).first()
        if task.type in Task.TOUR_TYPES.keys():
            if instance.is_cancelled != old_task.is_cancelled and instance.is_cancelled:
                return
            activity_type = Activity.TOUR_COMPLETED \
                if old_task.status != task.status and task.status == Task.TASK_COMPLETED else Activity.TOUR_UPDATED
            Activity.objects.create(property=task.property, lead=task.lead, type=activity_type,
                                    content=task.title, creator=instance.actor, object=instance)
        else:
            activity_type = Activity.TASK_COMPLETED \
                if old_task.status != task.status and task.status == Task.TASK_COMPLETED else Activity.TASK_UPDATED
            Activity.objects.create(property=task.property, lead=task.lead, type=activity_type,
                                    content=task.title, creator=instance.actor, object=instance)


@receiver(post_save, sender=Note)
def note_create_activity(sender, instance, created, **kwargs):
    if created:
        content = '{}...'.format(instance.text[0:125]) if len(instance.text) > 128 else instance.text
        Activity.objects.create(property=instance.property, lead=instance.lead, type=Activity.NOTE_CREATED,
                                content=content, object=instance, creator=instance.actor)


@receiver(post_save, sender=EmailMessage)
def email_create_activity(sender, instance, created, **kwargs):
    if created and instance.lead and instance.date > instance.lead.created and \
            instance.receiver_email == instance.lead.email and instance.property == instance.lead.property:
        content = '{}...'.format(instance.subject[0:125]) if len(instance.subject) > 128 else instance.subject
        Activity.objects.create(property=instance.property, lead=instance.lead, type=Activity.EMAIL_CREATED,
                                content=content, object=instance)


@receiver(pre_save, sender=ChatProspect)
def prospect_create_activity(sender, instance, **kwargs):
    prospect = ChatProspect.objects.filter(id=instance.id).first()
    if prospect and instance.guest_card and not prospect.guest_card:
        Activity.objects.create(property=instance.property, lead=instance.guest_card, content='Guest card created',
                                type=Activity.LEAD_CHAT_HOBBES, object=instance, creator=instance.active_agent)


@receiver(pre_save, sender=Lead)
def lead_update_activity(sender, instance, **kwargs):
    lead = instance
    old_lead = Lead.objects.filter(pk=lead.pk).first()
    if lead.pk and old_lead:
        content = None
        changed_fields = []
        if old_lead.stage != lead.stage:
            content = 'Stage updated to {}'.format(lead.get_stage_display())
            changed_fields.append('Stage')
        if lead.owner and old_lead.owner != lead.owner:
            content = 'Owner updated to {}'.format(lead.owner.email)
            changed_fields.append('Owner')
        if old_lead.status != lead.status:
            content = 'Status updated to {}'.format(lead.status_label)
            changed_fields.append('Status')
        if old_lead.move_in_date != lead.move_in_date and lead.move_in_date:
            content = 'Move in date updated to {}'.format(lead.move_in_date.strftime('%Y-%m-%d'))
            changed_fields.append('Move-in-date')
        if old_lead.email != lead.email and lead.email:
            content = 'Email updated to {}'.format(lead.email)
            changed_fields.append('Email')
        if old_lead.phone_number != lead.phone_number and lead.phone_number:
            content = 'Phone number updated to {}'.format(lead.phone_number)
            changed_fields.append('Phone number')
        if old_lead.source != lead.source and lead.source:
            content = 'Source updated to {}'.format(lead.source.name)
            changed_fields.append('Source')
        if old_lead.origin != lead.origin and lead.origin:
            content = 'Origin updated to {}'.format(lead.get_origin_display())
            changed_fields.append('Origin')
        if old_lead.moving_reason != lead.moving_reason and lead.moving_reason:
            content = 'Reason for moving updated to {}'.format(lead.moving_reason.reason)
            changed_fields.append('Reason for moving')
        if old_lead.desired_rent != lead.desired_rent and lead.desired_rent:
            content = 'Desired rent updated to ${}'.format(lead.desired_rent)
            changed_fields.append('Desired rent')
        if old_lead.best_contact_time != lead.best_contact_time and lead.best_contact_time:
            content = 'Best time to contact updated to {}'.format(lead.get_best_contact_time_display())
            changed_fields.append('Best time to contact')
        if old_lead.lease_term != lead.lease_term and lead.lease_term:
            content = 'Desired lease term updated to {}'.format(lead.lease_term)
            changed_fields.append('Desired lease term')
        if old_lead.best_contact_method != lead.best_contact_method and lead.best_contact_method:
            content = 'Contact preference updated to {}'.format(lead.get_best_contact_method_display())
            changed_fields.append('Contact preference')
        if old_lead.beds != lead.beds and lead.beds:
            content = 'Beds updated to {}'.format(lead.beds)
            changed_fields.append('Beds')
        if old_lead.baths != lead.baths and lead.baths:
            content = 'Baths updated to {}'.format(lead.baths)
            changed_fields.append('Baths')
        if old_lead.pets != lead.pets and lead.pets:
            content = 'Pets updated to {}'.format(lead.pets)
            changed_fields.append('Pets')
        if old_lead.pet_type != lead.pet_type and lead.pet_type:
            content = 'Pet type updated to {}'.format(lead.pet_type.name)
            changed_fields.append('Pet type')
        if old_lead.res_man_pet_weight != lead.res_man_pet_weight and lead.res_man_pet_weight:
            content = 'Pet weight updated to {}'.format(lead.res_man_pet_weight)
            changed_fields.append('Pet weight')
        if old_lead.real_page_pet_weight != lead.real_page_pet_weight and lead.real_page_pet_weight:
            content = 'Pet weight updated to {}'.format(lead.real_page_pet_weight.name)
            changed_fields.append('Pet weight')
        if old_lead.washer_dryer_method != lead.washer_dryer_method and lead.washer_dryer_method:
            content = 'Washer/Dryer updated to {}'.format(lead.get_washer_dryer_method_display())
            changed_fields.append('Washer/Dryer')
        if old_lead.occupants != lead.occupants and lead.occupants:
            content = 'Occupants updated to {}'.format(lead.occupants)
            changed_fields.append('Occupants')
        if old_lead.vehicles != lead.vehicles and lead.vehicles:
            content = 'Vehicles updated to {}'.format(lead.vehicles)
            changed_fields.append('Vehicles')

        if len(changed_fields) > 1:
            content = '{} were updated'.format(', '.join(changed_fields))
        if content:
            Activity.objects.create(property=instance.property, lead=lead, type=Activity.LEAD_UPDATED, content=content,
                                    creator=instance.actor)


@receiver(post_save, sender=SMSContent)
def sms_create_activity(sender, instance, created, **kwargs):
    if created and instance.lead and instance.property:
        current_date = datetime.now().astimezone(tz=instance.property.timezone).date()
        start = datetime.combine(current_date, datetime.min.time()).replace(tzinfo=instance.property.timezone)
        end = datetime.combine(current_date, datetime.max.time()).replace(tzinfo=instance.property.timezone)
        sent_count = SMSContent.objects.filter(
            property=instance.property,
            date__gte=start,
            date__lte=end,
            lead=instance.lead
        ).count()
        if not sent_count:
            return
        activity, created = Activity.objects.get_or_create(
            property=instance.property,
            type=Activity.SMS_CREATED,
            created__gte=start,
            created__lte=end,
            lead=instance.lead
        )
        content = '{} message exchanged' if sent_count == 1 else '{} messages exchanged'
        activity.content = content.format(sent_count)
        activity.created = timezone.now()
        activity.save()
