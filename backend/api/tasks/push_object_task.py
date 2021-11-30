import pusher
import logging

from collections import namedtuple
from django.utils import dateparse
from django.conf import settings
from django.utils import timezone

from backend.api.models import User, Property, Task
from backend.api.utils import get_image_url
from backend.celery_app import app


@app.task
def push_object_deleted(pk, property_id, model_str, socket_id=None):
    """
    Create new pusher event when model record is deleted
    :param socket_id:
    :param pk:
    :param unicode property_id:
    :param str model_str:
    """
    data = {'id': pk}

    event_name = '%s_deleted' % model_str.lower()
    push('private-property-%s' % property_id, event_name, data, socket_id)


@app.task
def push_object_saved(pk, model_str, created, socket_id=None, is_user_channel=False, request_data=None):
    """
    Create new pusher event when model record is created or updated
    :param socket_id:
    :param is_user_channel:
    :param pk:
    :param str model_str:
    :param basestring created:
    :param request_data:
    :raises model_class.DoesNotExist:
    """
    # reconvert string to an actual model class
    mod = __import__(
        'backend.api.models', fromlist=[
            model_str,
        ]
    )
    model_class = getattr(mod, model_str)
    try:
        obj = model_class.objects.get(pk=pk)
    except model_class.DoesNotExist:
        logging.error('%s %s not found' % (model_str, pk))
        return
    # get the resource based on the model class
    mod = __import__('backend.api.views', fromlist=[
        model_str + 'View',
    ])
    view_set = getattr(mod, model_str + 'View')()
    serializer = view_set.serializer_action_classes['retrieve'](
        obj) if model_str == 'Lead' else view_set.serializer_class(obj)
    if model_str in ['Lead', 'Call', 'Note'] and request_data:
        user = User.objects.filter(id=request_data.get('user_id')).first()
        property = Property.objects.filter(id=request_data.get('property_id')).first()
        RequestObject = namedtuple('RequestObject', ['user', 'property'])
        context = serializer.context
        request_object = {'request_data': RequestObject(user=user, property=property)} if model_str == 'Call' else {
            'request': RequestObject(user=user, property=property)}
        context.update(request_object)
    data = serializer.data

    action = 'created' if created else 'changed'
    event_name = '%s_%s' % (model_str.lower(), action)
    if is_user_channel:
        push('private-user-%s' % obj.user_id, event_name, data, socket_id)
    elif model_str in ['ChatConversation', 'ChatProspect']:
        push('private-chat', event_name, data, socket_id)
    elif model_str != 'User':
        push('private-property-%s' % obj.property.external_id, event_name, data, socket_id)

    if model_str == 'Task' and obj.type in Task.TOUR_TYPES.keys():
        prospects = obj.chat_prospects.all()
        tour = dict(data)
        for prospect in prospects:
            tour['tour_date'] = dateparse.parse_datetime(data['tour_date']).astimezone(prospect.property.timezone).isoformat()
            push('prospect-%s' % prospect.external_id, event_name, tour, socket_id)
    if model_str == 'ChatConversation':
        # Pusher event fired to prospect chat
        push('prospect-%s' % obj.prospect.external_id, event_name, data, socket_id)
    if model_str == 'User':
        conversation = obj.conversations.order_by('-date').first()
        if conversation:
            agent_avatar = None
            if obj.avatar and hasattr(obj.avatar, 'url'):
                agent_avatar = get_image_url(obj.avatar.url)
            push('prospect-%s' % conversation.prospect.external_id, event_name,
                 dict(active_agent=obj.first_name, agent_avatar=agent_avatar,
                      is_available=obj.is_available and conversation.prospect.property == obj.last_property), socket_id)
    if model_str == 'SMSContent':
        total_seconds = (timezone.now() - obj.date).total_seconds()
        logging.info(f'[SMS] SMS pusher event is fired after following seconds: {total_seconds}')
    logging.info(f'Pusher event is fired: {event_name}')


@app.task
def push_bulk_save(object, property_id, model_str, created, socket_id=None):
    data = object
    action = 'created' if created else 'changed'
    event_name = '%s_%s' % (model_str.lower(), action)
    push('private-property-%s' % property_id, event_name, data, socket_id)


@app.task
def push_bulk_delete(object, property_id, model_str, socket_id=None):
    data = object
    event_name = '%s_deleted' % (model_str.lower())
    push('private-property-%s' % property_id, event_name, data, socket_id)


@app.task
def push_available_agents_number(number, prospect_ids, socket_id=None):
    event_name = 'available_agents_number_changed'
    for prospect_id in prospect_ids:
        push('prospect-%s' % prospect_id, event_name, dict(available_agents_number=number), socket_id)


@app.task
def push_typing(prospect_id, prospect_external_id, agent_id, is_typing, type, socket_id=None):
    event_name = 'user_typing'
    if type == 'AGENT':
        push('prospect-%s' % prospect_external_id, event_name, dict(is_typing=is_typing), socket_id)
    else:
        push('private-user-%s' % agent_id, event_name, dict(is_typing=is_typing, prospect_id=prospect_id), socket_id)


def push(channel_name, event, data, socket_id=None):
    """
    Push an event to Pusher (http://pusher.com)

    :param socket_id:
    :param channel_name:
    :param event:
    :param data:
    """
    if getattr(settings, 'DISABLE_PUSHER', False):
        return
    client = pusher.Pusher(
        app_id=settings.PUSHER_APP_ID,
        key=settings.PUSHER_KEY,
        secret=settings.PUSHER_SECRET,
        cluster=settings.PUSHER_CLUSTER
    )
    client.trigger(channel_name, event, data, socket_id)
