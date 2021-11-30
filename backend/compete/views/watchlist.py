from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from backend.compete.models import Property, Market, Submarket, Comparison, WatchList
from backend.compete.serializer import ComparisonSerializer


class WatchlistView(ViewSet):
    def get_watchlist(self, request):
        user = request.user
        stored_watch_list_ids = list(user.watch_lists.filter(is_stored=True).values_list('id', flat=True))
        recent_watch_list_ids = list(user.watch_lists.order_by('-updated').values_list('id', flat=True)[:10])
        watch_lists_ids = list(set(stored_watch_list_ids + recent_watch_list_ids))
        watch_lists = user.watch_lists.filter(pk__in=watch_lists_ids)

        markets = [
            dict(id=item.market.id, name=item.market.name, is_stored=item.is_stored)
            for item in watch_lists.exclude(market=None).order_by('-updated')
        ]
        submarkets = [
            dict(id=item.submarket.id, name=item.submarket.name, is_stored=item.is_stored)
            for item in watch_lists.exclude(submarket=None).order_by('-updated')
        ]
        properties = [
            dict(id=item.property.id, name=item.property.name, is_stored=item.is_stored)
            for item in watch_lists.exclude(property=None).order_by('-updated')
        ]
        comparisons = []
        for item in watch_lists.exclude(comparison=None).order_by('-updated'):
            comparison = ComparisonSerializer(item.comparison).data
            comparison['is_stored'] = item.is_stored
            comparisons.append(comparison)

        return dict(markets=markets, submarkets=submarkets, properties=properties, comparisons=comparisons)

    def list(self, request):
        return Response(self.get_watchlist(request))

    def post(self, request):
        user = request.user

        object_id = self.request.data.get('object_id')
        object_type = self.request.data.get('object_type')

        defaults = dict()
        if 'is_stored' in self.request.data.keys():
            defaults = dict(is_stored=self.request.data.get('is_stored'))

        if object_type == 'property':
            property = get_object_or_404(Property.objects.all(), pk=object_id)
            WatchList.objects.update_or_create(
                user=user, property=property, defaults=defaults
            )

        elif object_type == 'market':
            market = get_object_or_404(Market.objects.all(), pk=object_id)
            WatchList.objects.update_or_create(
                user=user, market=market, defaults=defaults
            )

        elif object_type == 'submarket':
            submarket = get_object_or_404(Submarket.objects.all(), pk=object_id)
            WatchList.objects.update_or_create(
                user=user, submarket=submarket, defaults=defaults
            )

        elif object_type == 'comparison':
            comparison = get_object_or_404(Comparison.objects.all(), pk=object_id)
            WatchList.objects.update_or_create(
                user=user, comparison=comparison, defaults=defaults
            )

        else:
            raise ValidationError('Unable to find the object.')

        return Response(dict(success=True))
