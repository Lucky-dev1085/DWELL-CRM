import logging

from copy import copy
from django.db.models.signals import pre_save, m2m_changed, post_delete, pre_delete
from django.dispatch import receiver
from rest_framework.exceptions import ValidationError

from backend.api.models import User, Property

logging.getLogger().setLevel(logging.INFO)


@receiver(m2m_changed, sender=User.properties.through)
def check_properties_accessibility(sender, instance, action, **kwargs):
    user = instance
    if user.role in [User.P_ADMIN, User.G_ADMIN] and action == 'post_add':
        if user.customer and not set(user.properties.all()).issubset(set(user.customer.properties.all())):
            raise ValidationError(dict(property='Current user is not able to access given properties.'))
    return


@receiver(m2m_changed, sender=User.clients.through)
def check_clients_accessibility(sender, instance, action, **kwargs):
    user = instance
    if user.role in [User.P_ADMIN, User.G_ADMIN] and action == 'post_add':
        if user.customer and not set(user.clients.all()).issubset(set(user.customer.clients.all())):
            raise ValidationError(dict(property='Current user is not able to access given clients.'))
    return


@receiver(pre_save, sender=User)
def user_advanced_reports_access_update(sender, instance, **kwargs):
    user = User.objects.filter(pk=instance.pk).first()
    if not user or (user and user.role != instance.role):
        instance.has_advanced_reports_access = instance.role in [User.LL_ADMIN, User.C_ADMIN]


def replace_owner_with_property_account(property, instance):
    property_account = User.objects.filter(is_property_account=True, properties__in=[property]).first()
    if property_account:
        leads = instance.leads.filter(property=property)
        for lead in leads:
            lead.owner = property_account
            lead.save()

        tasks = instance.tasks.filter(property=property)
        for task in tasks:
            task.owner = property_account
            task.save()


@receiver(pre_delete, sender=User)
def replace_owner_with_property_account_pre_delete(sender, instance, **kwargs):
    instance.old_leads = copy(instance.leads.all())
    instance.old_tasks = copy(instance.tasks.all())
    instance.save()


@receiver(post_delete, sender=User)
def replace_owner_with_property_account_post_delete(sender, instance, **kwargs):
    for lead in instance.old_leads:
        property_account = User.objects.filter(is_property_account=True, properties__in=[lead.property]).first()
        if property_account:
            lead.owner = property_account
            lead.actor = None
            lead.save()
    for task in instance.old_tasks:
        property_account = User.objects.filter(is_property_account=True, properties__in=[task.property]).first()
        if property_account:
            task.owner = property_account
            task.actor = None
            task.save()


@receiver(m2m_changed, sender=User.properties.through)
def replace_owner_with_property_account_on_update(sender, instance, **kwargs):
    user = User.objects.filter(pk=instance.pk).first()
    action = kwargs.pop('action', None)
    if user and action == 'pre_remove':
        pk_set = kwargs.pop('pk_set', None)
        properties = Property.objects.filter(pk__in=list(pk_set))
        for property in properties:
            replace_owner_with_property_account(property, instance)
