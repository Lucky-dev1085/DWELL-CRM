from rest_framework import serializers
from backend.site.models import PageData
from backend.site.tasks import pull_on_site_floor_plans, pull_yardi_floor_plans


class PageDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageData
        fields = '__all__'


class PageDataSectionBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageData
        exclude = ['section', 'id', 'property']

    def update(self, instance, validated_data):
        should_update_units = False
        values = validated_data.get('values')

        if instance.section == PageData.FLOOR_PLANS:
            should_update_units = instance.values['feedSourceType'] != values['feedSourceType'] or \
                                  instance.values['propertyIds'] != values['propertyIds']

        super(PageDataSectionBaseSerializer, self).update(instance, validated_data)

        if should_update_units:
            if values['feedSourceType'] == 'ON_SITE':
                pull_on_site_floor_plans(instance.property.pk)
            if values['feedSourceType'] == 'YARDI':
                pull_yardi_floor_plans(instance.property.pk)
            if not len(values['propertyIds']):
                instance.values['allPlans'] = []
                instance.save()
            instance = PageData.objects.get(pk=instance.pk)
        return instance
