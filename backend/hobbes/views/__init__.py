from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from backend.api.permissions import HobbesAccessAuthorized
from backend.hobbes.models import SynonymMapping, Amenity, AmenityCategory, HobbesAutoTestQuestion
from backend.hobbes.serializer import SynonymMappingSerializer, AmenitySerializer, AmenityCategorySerializer, \
    HobbesAutoTestQuestionSerializer


@api_view(['GET'])
@permission_classes([HobbesAccessAuthorized])
def hobbes_static_data(request, **kwargs):
    synonym_mappings = SynonymMappingSerializer(SynonymMapping.objects.all(), many=True).data
    amenities = AmenitySerializer(Amenity.objects.all(), many=True).data
    amenity_categories = AmenityCategorySerializer(AmenityCategory.objects.all(), many=True).data

    return Response(
        dict(synonym_mappings=synonym_mappings, amenities=amenities, amenity_categories=amenity_categories),
        status=200
    )

@api_view(['GET'])
@permission_classes([HobbesAccessAuthorized])
def hobbes_auto_test_questions(request, **kwargs):
    hobbes_auto_questions = HobbesAutoTestQuestionSerializer(HobbesAutoTestQuestion.objects.all(), many=True).data

    return Response(
        dict(hobbes_auto_questions=hobbes_auto_questions),
        status=200
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def amenity_categories(request, **kwargs):
    return Response(AmenityCategory.objects.values('id', 'name'), status=200)

