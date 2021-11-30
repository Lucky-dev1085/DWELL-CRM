import pytz

from datetime import datetime
from django.utils import timezone
from mock import patch, MagicMock

from backend.api.factories import PropertyFactory, CallFactory, CallScoringQuestionFactory, ScoredCallFactory
from backend.api.models import Property, Call, CallScoringQuestion, Report
from backend.api.tests import PropertyLevelBaseTestCase
from backend.api.views.reports.report_utils import calculate_overall_data, get_calls_data, get_call_scoring_data

TZ = pytz.timezone('America/Phoenix')


class CallsReportUtilsTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(CallsReportUtilsTests, self).setUp()
        with patch('requests.get'):
            self.property_1 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)
            self.property_2 = PropertyFactory(client=self.m_client, status='ACTIVE', is_released=True)
            self.start_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.min.time()))
            self.end_date = TZ.localize(datetime.combine(datetime.now(tz=TZ), datetime.max.time()))

    @staticmethod
    def _generate_mock_questions(questions_count=0):
        """
        Generate call scoring questions factories.
        :param questions_count:
        :return:
        """
        with patch('requests.get'):
            for index in range(questions_count):
                CallScoringQuestionFactory(weight=10, order=index + 1)

    @staticmethod
    def _generate_mock_data(property, prospect_calls_count, call_result=Call.CALL_RESULT_COMPLETED, duration=100,
                            questions_count=0, questions_scored=0, questions_omitted=0, is_non_business=False):
        """
        Generate calls factories with given parameters.
        :param prospect_calls_count:
        :param call_result:
        :param duration:
        :return:
        """
        with patch('requests.get'):
            for index in range(prospect_calls_count):
                call = CallFactory(property=property, call_result=call_result,
                                   date=datetime.now(tz=TZ).replace(hour=0 if is_non_business else 13),
                                   duration=duration, call_category=Call.CALL_CATEGORY_PROSPECT)
                if questions_count:
                    scored_call = ScoredCallFactory(call=call, property=property, call_date=call.date,
                                                    scored_at=timezone.now())
                    scored_call.questions.set(CallScoringQuestion.objects.all().order_by('created')[:questions_scored])
                    scored_call.omitted_questions.set(
                        CallScoringQuestion.objects.exclude(
                            pk__in=scored_call.questions.values_list('pk', flat=True)
                        ).order_by('-created')[:questions_omitted]
                    )

    @staticmethod
    def create_report(property, calls_report_data, date):
        Report.objects.create(
            property=property, date=date,
            prospect_calls=calls_report_data['prospect_calls'], call_time=calls_report_data['call_time'],
            call_answered=calls_report_data['call_answered'], call_missed=calls_report_data['call_missed'],
            call_busy=calls_report_data['call_busy'], call_failed=calls_report_data['call_failed'])

    @staticmethod
    def create_call_scoring_report(property, calls_report_data, date):
        Report.objects.create(
            property=property, date=date,
            call_score=calls_report_data['call_score'],
            introduction_score=calls_report_data['introduction_score'],
            qualifying_score=calls_report_data['qualifying_score'],
            amenities_score=calls_report_data['amenities_score'], closing_score=calls_report_data['closing_score'],
            overall_score=calls_report_data['overall_score'])

    @patch('backend.api.models.Report.objects.values_list')
    def test_prospect_calls(self, mock_values_list):
        self._generate_mock_data(self.property_1, prospect_calls_count=10)
        calls_report = get_calls_data((self.start_date, self.end_date), Property.objects.all())
        self.create_report(self.property_1, calls_report, self.start_date)

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = calls_report[value]
            return [calls_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('calls_report', Report.objects.values())

        self.assertEqual(result['prospect_calls'], 10)

    @patch('backend.api.models.Report.objects.values_list')
    def test_average_call_time(self, mock_values_list):
        self._generate_mock_data(self.property_1, prospect_calls_count=10, duration=180)
        self._generate_mock_data(self.property_1, prospect_calls_count=10, duration=60)
        calls_report = get_calls_data((self.start_date, self.end_date), Property.objects.all())
        self.create_report(self.property_1, calls_report, self.start_date)

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = calls_report[value]
            return [calls_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('calls_report', Report.objects.values())

        self.assertEqual(result['average_call_time'], 2)

    @patch('backend.api.models.Report.objects.values_list')
    def test_answered_calls(self, mock_values_list):
        self._generate_mock_data(self.property_1, prospect_calls_count=10, call_result=Call.CALL_RESULT_COMPLETED)
        calls_report = get_calls_data((self.start_date, self.end_date), Property.objects.all())
        self.create_report(self.property_1, calls_report, self.start_date)

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = calls_report[value]
            return [calls_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('calls_report', Report.objects.values())

        self.assertEqual(result['call_answered']['percents'], 100)

    @patch('backend.api.models.Report.objects.values_list')
    def test_missed_calls(self, mock_values_list):
        self._generate_mock_data(self.property_1, prospect_calls_count=10, call_result=Call.CALL_RESULT_NO_ANSWER)
        calls_report = get_calls_data((self.start_date, self.end_date), Property.objects.all())
        self.create_report(self.property_1, calls_report, self.start_date)

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = calls_report[value]
            return [calls_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('calls_report', Report.objects.values())

        self.assertEqual(result['call_missed']['percents'], 100)

    @patch('backend.api.models.Report.objects.values_list')
    def test_busy_calls(self, mock_values_list):
        self._generate_mock_data(self.property_1, prospect_calls_count=10, call_result=Call.CALL_RESULT_BUSY)
        calls_report = get_calls_data((self.start_date, self.end_date), Property.objects.all())
        self.create_report(self.property_1, calls_report, self.start_date)

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = calls_report[value]
            return [calls_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('calls_report', Report.objects.values())

        self.assertEqual(result['call_busy']['percents'], 100)

    @patch('backend.api.models.Report.objects.values_list')
    def test_failed_calls(self, mock_values_list):
        self._generate_mock_data(self.property_1, prospect_calls_count=10, call_result=Call.CALL_RESULT_FAILED)
        calls_report = get_calls_data((self.start_date, self.end_date), Property.objects.all())
        self.create_report(self.property_1, calls_report, self.start_date)

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = calls_report[value]
            return [calls_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('calls_report', Report.objects.values())

        self.assertEqual(result['call_failed']['percents'], 100)

    @patch('backend.api.models.Report.objects.values_list')
    def test_average_call_score(self, mock_values_list):
        self._generate_mock_questions(questions_count=10)
        self._generate_mock_data(self.property_1, prospect_calls_count=10, questions_count=10, questions_scored=5)
        self._generate_mock_data(self.property_2, prospect_calls_count=10, questions_count=10, questions_scored=10)
        calls_report = get_call_scoring_data((self.start_date, self.end_date), Property.objects.all())
        self.create_call_scoring_report(self.property_1, calls_report, self.start_date)
        self.create_call_scoring_report(self.property_2, calls_report, self.start_date)

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = calls_report[value]
            return [calls_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('calls_report', Report.objects.values())

        self.assertEqual(result['average_call_score'], 75)

    @patch('backend.api.models.Report.objects.values_list')
    def test_call_score_with_omitted_data(self, mock_values_list):
        self._generate_mock_questions(questions_count=10)
        self._generate_mock_data(
            self.property_1, prospect_calls_count=10, questions_count=10, questions_scored=3, questions_omitted=4
        )
        # 3 * 100 / (10 - 4) = 50
        calls_report = get_call_scoring_data((self.start_date, self.end_date), Property.objects.all())
        self.create_call_scoring_report(self.property_1, calls_report, self.start_date)

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = calls_report[value]
            return [calls_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('calls_report', Report.objects.values())

        self.assertEqual(result['average_call_score'], 50)

    @patch('backend.api.models.Report.objects.values_list')
    def test_non_business_missed_calls(self, mock_values_list):
        self._generate_mock_data(self.property_1, prospect_calls_count=10,
                                 call_result=Call.CALL_RESULT_NO_ANSWER,
                                 is_non_business=True)
        calls_report = get_calls_data((self.start_date, self.end_date), Property.objects.all())
        self.create_report(self.property_1, calls_report, self.start_date)

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = calls_report[value]
            return [calls_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('calls_report', Report.objects.values())

        self.assertEqual(result['call_missed']['percents'], 0)

    @patch('backend.api.models.Report.objects.values_list')
    def test_missed_calls_duration(self, mock_values_list):
        self._generate_mock_data(self.property_1, prospect_calls_count=10,
                                 call_result=Call.CALL_RESULT_NO_ANSWER, duration=4)
        calls_report = get_calls_data((self.start_date, self.end_date), Property.objects.all())
        self.create_report(self.property_1, calls_report, self.start_date)

        def side_effect(value, flat=True):
            mock = MagicMock()
            mock.return_value = calls_report[value]
            return [calls_report[value]]

        mock_values_list.side_effect = side_effect
        result = calculate_overall_data('calls_report', Report.objects.values())

        self.assertEqual(result['call_missed']['percents'], 0)
