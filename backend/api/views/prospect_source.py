from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import SessionAuthentication
from backend.api.models import ProspectSource
from backend.api.permissions import DwellAuthorized
from backend.api.serializer import SourceSpendsSerializer
from backend.api.views import PropertyLevelViewSet
from backend.api.views.pagination import CustomResultsSetPagination


class ProspectSourceView(PropertyLevelViewSet):
    serializer_class = SourceSpendsSerializer
    permission_classes = [DwellAuthorized]
    pagination_class = CustomResultsSetPagination
    queryset = ProspectSource.objects.all()
    http_method_names = ['get', 'patch', 'put']

    @action(methods=['PUT'], detail=False)
    def update_spends(self, request, **kwargs):
        spends = request.data.get('spends', [])
        for key in spends:
            ProspectSource.objects.filter(id=key).update(spends=spends[key])
        return Response(spends, status=201)

    @action(methods=['GET'], detail=False, permission_classes=[IsAuthenticated, IsAdminUser],
            authentication_classes=[SessionAuthentication])
    def available_sources_for_tracking(self, *args, **kwargs):
        serializer = self.serializer_class(
            self.queryset.filter(property=self.request.GET['property'], phone_numbers=None).order_by('name'), many=True)
        return Response(serializer.data, status=200)
