# from django.db import transaction
# from django.utils.decorators import method_decorator
from rest_framework import viewsets


# @method_decorator(transaction.atomic, name='dispatch')
# todo This will block the requests when querying on model, need to debug how to resolve it.
class BaseViewSet(viewsets.ModelViewSet):
    pass
