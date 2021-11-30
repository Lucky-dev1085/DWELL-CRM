from backend.api import views


class PropertyLevelViewSet(views.BaseViewSet):
    queryset = None
    serializer_class = None

    def get_queryset(self):
        return self.queryset.filter(property=self.request.property)

    def perform_create(self, serializer):
        serializer.save(property=self.request.property)

    def perform_update(self, serializer):
        serializer.save(property=self.request.property)
