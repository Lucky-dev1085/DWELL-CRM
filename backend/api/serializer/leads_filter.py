from rest_framework import serializers
from backend.api.models import LeadsFilter, LeadsFilterItem, Lead, ActiveLeadsFilter


class LeadsFilterItemSerializer(serializers.ModelSerializer):

    def validate_compare_field(self, value):
        if value not in [field.name for field in Lead._meta.get_fields()] and value not in ['next_task_due_date',
                                                                                            'days_move_in']:
            raise serializers.ValidationError('Given field is not in available choices')
        return value

    class Meta:
        model = LeadsFilterItem
        exclude = ['updated', 'created', 'lead_filter']


class LeadsFilterSerializer(serializers.ModelSerializer):
    filter_items = LeadsFilterItemSerializer(many=True)

    class Meta:
        model = LeadsFilter
        exclude = ('property', )

    def validate_filter_items(self, value):
        if not value or not len(value):
            raise serializers.ValidationError('This field should not be empty.')
        return value

    def create(self, validated_data):
        filter_items = validated_data.pop('filter_items', [])
        instance = LeadsFilter.objects.create(**validated_data)
        serializer = LeadsFilterItemSerializer(data=filter_items, many=True, context=dict(lead_filter=instance))
        if serializer.is_valid(raise_exception=True):
            serializer.save(lead_filter=instance)
        return instance

    def update(self, instance, validated_data):
        filter_items = validated_data.pop('filter_items', [])
        LeadsFilter.objects.filter(pk=instance.pk).update(**validated_data)
        ids = [item.get('id') for item in filter_items if item.get('id')]
        LeadsFilterItem.objects.filter(lead_filter=instance).exclude(pk__in=ids).delete()
        for filter_item in filter_items:
            filter_item_instance = None
            pk = filter_item.get('id')
            if pk:
                try:
                    filter_item_instance = LeadsFilterItem.objects.get(pk=filter_item.get('id'))
                except LeadsFilterItem.DoesNotExist:
                    raise serializers.ValidationError('Given filter item id is correct : %s' % filter_item.get('id'))
            serializer = LeadsFilterItemSerializer(filter_item_instance, data=filter_item, context=dict(lead_filter=instance))
            if serializer.is_valid(raise_exception=True):
                serializer.save(lead_filter=instance)
        return instance


class ActiveLeadsFilterSerializer(serializers.ModelSerializer):
    filter_id = serializers.SerializerMethodField()

    def get_filter_id(self, instance):
        active_filter = ActiveLeadsFilter.objects.filter(user=instance, property=self.request.property).first()
        if not active_filter:
            return None
        if active_filter.is_default_filter:
            return active_filter.lead_default_filter
        else:
            return active_filter.lead_filter.pk if active_filter.lead_filter else None

    class Meta:
        model = ActiveLeadsFilter
        fields = '__all__'
