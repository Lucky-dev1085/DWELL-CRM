from django.db import connection
from rest_framework.response import Response
from rest_framework import status

from backend.api import views
from backend.api.models import Task, Note, Roommate, Lead
from backend.api.views.notification_creation import note_notification, task_notification


class LeadLevelViewSet(views.BaseViewSet):
    queryset = None
    serializer_class = None

    def get_queryset(self):
        queryset = self.queryset.filter(property=self.request.property).order_by('-created')
        if hasattr(self.request, 'lead') and Lead.objects.filter(pk=self.request.lead.id).first().shared_leads.filter(
                property=self.request.property).exists():
            queryset = self.queryset.order_by('-created')
        return queryset.filter(lead=self.request.lead) if hasattr(self.request, 'lead') else queryset

    def perform_create(self, serializer):
        args = dict(property=self.request.property, actor=self.request.user) \
            if self.get_queryset().model in [Task, Note] else dict(property=self.request.property)
        if hasattr(self.request, 'lead'):
            args.update({'lead': self.request.lead})
        instance = serializer.save(**args)

        if isinstance(instance, Roommate):
            sync_room_mates_delayed = instance.sync_room_mates()
            if sync_room_mates_delayed:
                connection.on_commit(sync_room_mates_delayed)

        if isinstance(instance, Note):
            note_notification(self.request, instance)

        if isinstance(instance, Task):
            task_notification(self.request, instance)

    def perform_update(self, serializer):
        old_task = None
        note_mentions = []
        if self.get_queryset().model == Task:
            old_task = Task.objects.filter(pk=self.kwargs.get('pk')).first()
        if self.get_queryset().model == Note:
            note_mentions = [note for note in Note.objects.filter(pk=self.kwargs.get('pk')).first().mentions.all()]

        args = dict(property=self.request.property, actor=self.request.user) \
            if self.get_queryset().model in [Task, Note] else dict(property=self.request.property)
        if hasattr(self.request, 'lead'):
            args.update({'lead': self.request.lead})
        instance = serializer.save(**args)

        if isinstance(instance, Roommate):
            sync_room_mates_delayed = instance.sync_room_mates()
            if sync_room_mates_delayed:
                connection.on_commit(sync_room_mates_delayed)

        if isinstance(instance, Note):
            note_notification(self.request, instance, note_mentions)

        if isinstance(instance, Task):
            task_notification(self.request, instance, old_task)

    def destroy(self, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        super().destroy(*args, **kwargs)
        return Response(serializer.data, status=status.HTTP_200_OK)
