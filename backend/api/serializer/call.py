from django.conf import settings

from rest_framework import serializers
from backend.api.models import Call, CallScoringQuestion, ScoredCall
from backend.api.utils import format_private_static_url


class CallSerializer(serializers.ModelSerializer):
    score = serializers.SerializerMethodField()
    prev_score = serializers.SerializerMethodField()
    rescore_reason = serializers.SerializerMethodField()
    recording = serializers.SerializerMethodField()
    transcription = serializers.SerializerMethodField()

    class Meta:
        model = Call
        fields = '__all__'

    def get_score(self, instance):
        questions = CallScoringQuestion.objects.all()
        scored_call = instance.scored_calls.first()
        if scored_call:
            overall_weights = sum(
                [question.weight for question in questions.exclude(pk__in=scored_call.omitted_questions.all())]
            )
            call_weights = sum([question.weight for question in scored_call.questions.all()])
            if scored_call.omitted_questions.all().count() == questions.count():
                return 'N/A'
            return round(call_weights * 100 / overall_weights, 1) if overall_weights != 0 else '-'
        return '-'

    def get_prev_score(self, instance):
        scored_call = instance.scored_calls.first()
        return scored_call.prev_score if scored_call and scored_call.rescore_status == 'RESCORED' else None

    def get_rescore_reason(self, instance):
        scored_call = instance.scored_calls.first()
        return scored_call.rescore_reason if scored_call else None

    def get_recording(self, instance):
        if not instance.recording:
            return None
        return format_private_static_url(instance.recording.url)

    def get_transcription(self, instance):
        if not instance.transcription:
            return None

        return format_private_static_url(
            instance.transcription, getattr(settings, 'AWS_TRANSCRIPTION_BUCKET_NAME', None)
        )


class CallScoringQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallScoringQuestion
        fields = '__all__'


class ScoredCallSerializer(serializers.ModelSerializer):
    questions = serializers.PrimaryKeyRelatedField(
        queryset=CallScoringQuestion.objects.all(), many=True, required=False
    )
    omitted_questions = serializers.PrimaryKeyRelatedField(
        queryset=CallScoringQuestion.objects.all(), many=True, required=False
    )

    class Meta:
        model = ScoredCall
        fields = '__all__'

    def create(self, validated_data):
        questions = validated_data.pop('questions', [])
        omitted_questions = validated_data.pop('omitted_questions', [])
        scored_call = ScoredCall.objects.create(**validated_data)
        for question in questions:
            scored_call.questions.add(question)
        for question in omitted_questions:
            scored_call.omitted_questions.add(question)
        return scored_call

    def update(self, instance, validated_data):
        if self.instance.rescore_status == 'REQUIRED':
            validated_data['rescore_status'] = 'RESCORED'
        return super(ScoredCallSerializer, self).update(instance, validated_data)


class CallCommunicationSerializer(serializers.ModelSerializer):
    recording = serializers.SerializerMethodField()
    transcription = serializers.SerializerMethodField()

    class Meta:
        model = Call
        fields = ('id', 'source', 'duration', 'recording', 'transcription', 'date', 'call_result')

    def get_recording(self, instance):
        if not instance.recording:
            return None

        return format_private_static_url(instance.recording.url)

    def get_transcription(self, instance):
        if not instance.transcription:
            return None

        return format_private_static_url(
            instance.transcription, getattr(settings, 'AWS_TRANSCRIPTION_BUCKET_NAME', None)
        )
