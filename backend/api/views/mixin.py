from django.db import connection
from backend.api.tasks import push_object_saved, push_object_deleted
from backend.api.utils import get_pusher_socket_id


class GetSerializerClassMixin(object):

    def get_serializer_class(self):
        """
        A class which inhertis this mixins should have variable
        `serializer_action_classes`.
        Look for serializer class in self.serializer_action_classes, which
        should be a dict mapping action name (key) to serializer class (value),
        i.e.:
        class SampleViewSet(viewsets.ViewSet):
            serializer_class = DocumentSerializer
            serializer_action_classes = {
               'upload': UploadDocumentSerializer,
               'download': DownloadDocumentSerializer,
            }
            @action
            def upload:
                ...
        If there's no entry for that action then just fallback to the regular
        get_serializer_class lookup: self.serializer_class, DefaultSerializer.
        """
        try:
            return self.serializer_action_classes[self.action]
        except (KeyError, AttributeError):
            return super().get_serializer_class()


class PusherMixin(object):

    def create(self, request, *args, **kwargs):
        updated_bundle = super(PusherMixin, self).create(request, *args, **kwargs)

        if not hasattr(request, 'property'):
            # When the request comes from "All Properties" mode.
            return updated_bundle

        socket_id = get_pusher_socket_id(request)
        request_data = dict(user_id=request.user.id, property_id=request.property.id)

        def push_delayed():
            push_object_saved.delay(updated_bundle.data.get('id'),
                                    updated_bundle.data.serializer.instance.__class__.__name__, True, socket_id,
                                    request_data=request_data)

        connection.on_commit(push_delayed)
        return updated_bundle

    def update(self, request, *args, **kwargs):
        updated_bundle = super(PusherMixin, self).update(request, *args, **kwargs)

        if not hasattr(request, 'property'):
            return updated_bundle

        socket_id = get_pusher_socket_id(request)
        request_data = dict(user_id=request.user.id, property_id=request.property.id)

        def push_delayed():
            push_object_saved.delay(updated_bundle.data.get('id'),
                                    updated_bundle.data.serializer.instance.__class__.__name__, False, socket_id,
                                    request_data=request_data)

        connection.on_commit(push_delayed)
        return updated_bundle

    def destroy(self, request, **kwargs):
        updated_bundle = super(PusherMixin, self).destroy(request, **kwargs)
        object_id = kwargs['pk']
        socket_id = get_pusher_socket_id(request)

        def push_delayed():
            if hasattr(request, 'property'):
                push_object_deleted.delay(object_id, request.property.external_id,
                                          self.serializer_class.Meta.model.__name__, socket_id)

        connection.on_commit(push_delayed)
        return updated_bundle
