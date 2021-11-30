from django import forms
from django.contrib.admin.widgets import AdminDateWidget
from django_countries import countries, widgets

from backend.api.models import Property, ProspectSource, PhoneNumber, Unit, Lead, FloorPlan, User, Client, \
    EmailLabel, EmailMessage, Note, Portfolio, Task, ScoredCall, CallScoringQuestion, RealPageEmployee, \
    ResManEmployee, DemoTour
from backend.api.widgets import CustomDateTimePickerInput


class PropertyBasedActionForm(forms.Form):
    TYPE_CHOICES = (
        (None, 'Select Type'),
        ('Report', 'Report'),
        ('CallExport', 'Calls export'),
    )
    start_date = forms.DateField(widget=AdminDateWidget())
    end_date = forms.DateField(widget=AdminDateWidget(), required=False)
    type = forms.ChoiceField(choices=TYPE_CHOICES)
    properties = forms.ModelMultipleChoiceField(queryset=Property.objects.all(), widget=forms.SelectMultiple())


class PhoneNumberForm(forms.ModelForm):
    AREA_CODE_CHOICES = (
        (None, 'Select Area Code'),
        (480, 480),
        (602, 602),
        (623, 623),
        (844, 844)
    )
    TYPE_CHOICES = (
        (None, 'Select Type'),
        (PhoneNumber.TYPE_SMS, 'SMS'),
        (PhoneNumber.TYPE_TRACKING, 'Tracking')
    )

    area_code = forms.ChoiceField(choices=AREA_CODE_CHOICES)
    phone_number = forms.CharField()
    property = forms.ModelChoiceField(queryset=Property.objects.all().order_by('name'), required=False)
    source = forms.ModelChoiceField(queryset=ProspectSource.objects.filter(phone_numbers=None).order_by('name'),
                                    required=False)
    is_active = forms.BooleanField(initial=True, required=False)
    target_phone_number = forms.CharField(label='Property Target Number', required=False)
    type = forms.ChoiceField(choices=TYPE_CHOICES)

    class Meta:
        model = PhoneNumber
        fields = (
            'area_code', 'property', 'source', 'is_active', 'phone_number', 'type', 'twilio_sid', 'target_phone_number')

    def __init__(self, *args, **kwargs):
        super(PhoneNumberForm, self).__init__(*args, **kwargs)
        phone_number = kwargs.pop('instance', None)
        if phone_number:
            self.fields['target_phone_number'].initial = phone_number.property.phone_number
            self.fields['area_code'].required = False
            if phone_number.type != PhoneNumber.TYPE_SMS:
                self.fields['source'].queryset = self.fields['source'].queryset.filter(
                    property=phone_number.property).union(
                    ProspectSource.objects.filter(id=phone_number.source.pk if phone_number.source else None,
                                                  property=phone_number.property)).order_by('name')
            else:
                self.fields['property'].queryset = self.fields['property'].queryset.filter(
                    id=phone_number.property.pk).union(self.fields['property'].queryset.exclude(
                    id__in=PhoneNumber.objects.filter(type=PhoneNumber.TYPE_SMS).values_list('property',
                                                                                             flat=True))).order_by(
                    'name')
        elif len(args) > 0 and args[0].get('property'):
            self.fields['source'].queryset |= ProspectSource.objects.filter(property=args[0].get('property')).order_by(
                'name')


class PropertyForm(forms.ModelForm):
    class Meta:
        model = Property
        fields = ('name', 'phone_number')


class LeadForm(forms.ModelForm):
    units = forms.ModelMultipleChoiceField(widget=forms.SelectMultiple(), queryset=Unit.objects.all().order_by('unit'),
                                           required=False)
    floor_plan = forms.ModelMultipleChoiceField(widget=forms.SelectMultiple(),
                                                queryset=FloorPlan.objects.all().order_by('plan'), required=False)

    class Meta:
        model = Lead
        fields = '__all__'


class UserForm(forms.ModelForm):
    properties = forms.ModelMultipleChoiceField(widget=forms.SelectMultiple(),
                                                queryset=Property.objects.all().order_by('name'),
                                                required=False)
    clients = forms.ModelMultipleChoiceField(widget=forms.SelectMultiple(),
                                             queryset=Client.objects.all().order_by('name'),
                                             required=False)

    class Meta:
        model = User
        fields = '__all__'


class EmailMessageForm(forms.ModelForm):
    labels = forms.ModelMultipleChoiceField(widget=forms.SelectMultiple(),
                                            queryset=EmailLabel.objects.all().order_by('name'),
                                            required=False)

    class Meta:
        model = EmailMessage
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super(EmailMessageForm, self).__init__(*args, **kwargs)
        email_message = kwargs.pop('instance', None)
        if email_message:
            self.fields['labels'].queryset = EmailLabel.objects.filter(property=email_message.property)


class NoteForm(forms.ModelForm):
    mentions = forms.ModelMultipleChoiceField(widget=forms.SelectMultiple(),
                                              queryset=User.objects.all().order_by('email'),
                                              required=False)

    class Meta:
        model = Note
        fields = '__all__'


class PortfolioForm(forms.ModelForm):
    properties = forms.ModelMultipleChoiceField(widget=forms.SelectMultiple(),
                                                queryset=Property.objects.all().order_by('name'),
                                                required=False)

    class Meta:
        model = Portfolio
        fields = '__all__'


class PropertyAdminForm(forms.ModelForm):
    nylas_selected_labels = forms.ModelMultipleChoiceField(widget=forms.SelectMultiple(),
                                                           queryset=EmailLabel.objects.all().order_by('name'),
                                                           required=False)
    tour_types = forms.MultipleChoiceField(widget=forms.SelectMultiple(),
                                           choices=Property.TOUR_TYPE_CHOICES,
                                           required=False)
    bedroom_types = forms.MultipleChoiceField(widget=forms.SelectMultiple(),
                                              choices=Property.BEDROOM_TYPE_CHOICES,
                                              required=False)
    country = forms.ChoiceField(widget=widgets.CountrySelectWidget(), choices=countries, required=False)

    class Meta:
        model = Property
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super(PropertyAdminForm, self).__init__(*args, **kwargs)
        property = kwargs.pop('instance', None)
        if property:
            self.fields['nylas_selected_labels'].queryset = EmailLabel.objects.filter(property=property)


class TaskForm(forms.ModelForm):
    units = forms.ModelMultipleChoiceField(widget=forms.SelectMultiple(), queryset=Unit.objects.all().order_by('unit'),
                                           required=False)

    class Meta:
        model = Task
        fields = '__all__'


class ScoredCallAdminForm(forms.ModelForm):
    questions = forms.ModelMultipleChoiceField(widget=forms.SelectMultiple(),
                                               queryset=CallScoringQuestion.objects.all().order_by('question'),
                                               required=False)
    omitted_questions = forms.ModelMultipleChoiceField(widget=forms.SelectMultiple(),
                                                       queryset=CallScoringQuestion.objects.all().order_by('question'),
                                                       required=False)

    class Meta:
        model = ScoredCall
        fields = '__all__'


class DuplicateEmailTemplates(forms.Form):
    _selected_action = forms.CharField(widget=forms.MultipleHiddenInput)
    properties = forms.ModelMultipleChoiceField(queryset=Property.objects.filter(is_released=True).order_by('name'),
                                                label='',
                                                widget=forms.SelectMultiple(
                                                    attrs={'id': 'id_properties', 'multiple': 'multiple'}))


class HolidayForm(forms.ModelForm):
    country = forms.ChoiceField(widget=widgets.CountrySelectWidget(), choices=countries, required=False)

    class Meta:
        model = Property
        fields = '__all__'


class RealPageEmployeeForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(RealPageEmployeeForm, self).__init__(*args, **kwargs)
        self.fields['user'].queryset = User.objects.all()

    class Meta:
        model = RealPageEmployee
        fields = '__all__'


class ResManEmployeeForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(ResManEmployeeForm, self).__init__(*args, **kwargs)
        self.fields['user'].queryset = User.objects.all()

    class Meta:
        model = ResManEmployee
        fields = '__all__'


class DemoTourForm(forms.ModelForm):
    date = forms.DateTimeField(
        input_formats=['%Y-%m-%dT%H:%M:%S%z'],
        widget=CustomDateTimePickerInput(format='%Y-%m-%dT%H:%M:%S%z'),
    )

    class Meta:
        model = DemoTour
        fields = '__all__'


class ILSTestEmailForm(forms.Form):
    SOURCE_CHOICES = (
        (None, 'Select Type'),
        ('mt', 'Mark Taylor'),
        ('apartmentlist', 'Apartment list'),
        ('yelp', 'Yelp'),
    )
    first_name = forms.CharField(required=False)
    last_name = forms.CharField(required=False)
    email = forms.CharField(required=False)
    phone_number = forms.CharField(required=False)
    source = forms.ChoiceField(choices=SOURCE_CHOICES)
    beds = forms.IntegerField()
    baths = forms.IntegerField()
    pets = forms.ChoiceField(choices=((None, 'Select Type'),) + Lead.PET_TYPE_CHOICES)
    desired_rent = forms.FloatField()
    desired_lease_term = forms.IntegerField()
    move_in_date = forms.DateField()
    comments = forms.CharField()
    property = forms.ModelChoiceField(queryset=Property.objects.all())
