import json
import datetime
from django.urls import reverse
from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from backend.api.models import EmailMessage, Lead, ILSEmail
from backend.api.tasks import convert_ils_emails_to_leads
from backend.api.tests import PropertyLevelBaseTestCase
from unittest.mock import patch
from backend.api.factories import EmailMessageFactory


class EmailMessageTests(PropertyLevelBaseTestCase):
    def setUp(self):
        super(EmailMessageTests, self).setUp()

    def test_list_email_message(self):
        """
        Ensure we can list assign email message objects.
        """
        EmailMessageFactory(property=self.property)
        EmailMessageFactory(property=self.property)
        endpoint = reverse('email_messages-list')
        response = self.client.get(endpoint)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.get(endpoint, **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(EmailMessage.objects.count(), 2)

    @patch('backend.api.tasks.nylas.archive_email_messages.archive_messages_task')
    def test_archive_email_message(self, mock_archive_messages_task):
        """
        Ensure we can archive email message object.
        """

        email_message1 = EmailMessageFactory(property=self.property, is_unread=True, is_archived=False)
        email_message2 = EmailMessageFactory(property=self.property, is_unread=True, is_archived=False)

        endpoint = reverse('email_messages-archive-messages')
        response = self.client.post(endpoint, dict(ids=[email_message1.pk, email_message2.pk]), format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(EmailMessage.objects.filter(is_archived=True).count(), 0)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, dict(ids=[email_message1.pk, email_message2.pk]), format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(EmailMessage.objects.filter(is_archived=True).count(), 2)

    @patch('nylas.client.restful_model_collection.RestfulModelCollection.get')
    @patch('nylas.client.restful_models.Draft.send')
    @patch('backend.api.tasks.nylas.utils.create_email_message_from_nylas')
    def test_send_email_message(self, mock_get, mock_send, mock_create_email_message_from_nylas):
        """
        Ensure we can send email message object.
        """
        email_message = EmailMessageFactory(property=self.property, is_unread=False, is_archived=False,
                                            is_replied_to=False)
        mock_get.return_value = dict(id=email_message.pk)
        send_message = dict(property=self.property.pk, body='test', subject='test', id='test', snippet='test',
                            to=[dict(name='test1', email='test1@gmail.com')],
                            date=datetime.datetime.timestamp(timezone.now()),
                            from_=[dict(name='test2', email='test2@gmail.com')],
                            message_id=email_message.pk, cc=[], unread=False)
        send_message['from'] = send_message.pop('from_')
        mock_send.return_value = send_message
        endpoint = reverse('email_messages-send-message')
        data = dict(message_data=json.dumps(dict(property=self.property.pk, body='test', subject='test',
                                                 receiver=[dict(name='test1', email='test1@gmail.com')],
                                                 sender=[dict(name='test2', email='test2@gmail.com')])))
        response = self.client.post(endpoint, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        header = {'HTTP_X_NAME': 'test1'}
        response = self.client.post(endpoint, data, format='json', **header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @override_settings(ILS_ENABLED=True)
    def test_ils_email_delivery(self):
        """
        Ensure ILS emails were converted to lead properly across all sources.
        """
        self.property.external_id = 'bellagio'
        self.property.save()

        G5_email_body = {
            'notificationType': 'Received',
            'mail': {
                'timestamp': '2020-03-26T12:58:19.827Z',
                'source': 'bounces+7053930-4552-bellagio.mt=dwell.io@sendgrid.net',
                'messageId': '7j11v3stsermtr6fu57narbcj9tjdbs8i7jnaio1',
                'destination': [
                    'bellagio.mt@dwell.io'
                ],
                'headersTruncated': False,
                'headers': [
                    {
                        'name': 'Return-Path',
                        'value': '<bounces+7053930-4552-bellagio.mt=dwell.io@sendgrid.net>'
                    },
                    {
                        'name': 'Received',
                        'value': 'from o3.email.g5search.com (o3.email.g5search.com [149.72.164.173]) by inbound-smtp.us-east-1.amazonaws.com with SMTP id 7j11v3stsermtr6fu57narbcj9tjdbs8i7jnaio1 for bellagio.mt@dwell.io; Thu, 26 Mar 2020 12:58:19 +0000 (UTC)'
                    },
                    {
                        'name': 'Received-SPF',
                        'value': 'pass (spfCheck: domain of sendgrid.net designates 149.72.164.173 as permitted sender) client-ip=149.72.164.173; envelope-from=bounces+7053930-4552-bellagio.mt=dwell.io@sendgrid.net; helo=o3.email.g5search.com;'
                    },
                    {
                        'name': 'Authentication-Results',
                        'value': 'amazonses.com; spf=pass (spfCheck: domain of sendgrid.net designates 149.72.164.173 as permitted sender) client-ip=149.72.164.173; envelope-from=bounces+7053930-4552-bellagio.mt=dwell.io@sendgrid.net; helo=o3.email.g5search.com; dkim=pass header.i=@sendgrid.net; dmarc=fail header.from=g5searchmarketing.com;'
                    },
                    {
                        'name': 'X-SES-RECEIPT',
                        'value': 'AEFBQUFBQUFBQUFGU2dsTFJ4UXV3dUJqR1dWdjU5K0lGKzh3SFFZK1dEcXFHWGxka1RXWmtQUEk3SEdsU0lGWWQvY0hVUkJCL0tyTTMrTnRjR3NsT0pLU08raHROZnRaalRoTEIxR3R3bmRqOEcxMlJEYTVRTzN2NU1URG1ZTGwvOC9ibGNFbDBKRHZZWGtuMjFkanpyVC9ob1dkbklqOVZkVHBDRkNxZVpmdlJuNTd2RkVBRGRTTCtiVkZETnJRbVhrR1lZSkEvakNwSUgwbnlPeWFKL2ZLc0xiREFwQ0lyTHIwYkNMb1o4bUdSY1pBQUE2dnpmWGl5b2VVU0hQYVAvSEU0NzZYVDJJTXVpN0dpd3hJYTBuVThiTkJ2TDRIalJQbFN6RHQ2eUR0OFNWL1gxT2dzVFpOdzBaa0xKTEYxaytrQ1QzWlJlS0lrLzlXNVhRMmE3eUhpSFZUb0lYU0ZNeW5zaW1nWmw0VXY5Rk5MUlBvN3JRPT0='
                    },
                    {
                        'name': 'X-SES-DKIM-SIGNATURE',
                        'value': 'a=rsa-sha256; q=dns/txt; b=dnYWYc5siEUiO3Ym0/v1/XAycS5bvqJOFc/HpPjVWKcXG9FNBawgvS3Ot46R6MCevkYovuYln2MSk/ySVL7SeHFiTg7u4BouWyY1RDc6ZNjM4YRIXvCxjOkUr52I3ffkg9YK4emTgZNTeLzA8Ci13AD5Irozqx8dtC2cx1uf36o=; c=relaxed/simple; s=224i4yxa5dv7c2xz3womw6peuasteono; d=amazonses.com; t=1585227500; v=1; bh=DtUtp4OKT2ARCy2ZrHp/RJGanBGfYkciIx82Gx2G9wU=; h=From:To:Cc:Bcc:Subject:Date:Message-ID:MIME-Version:Content-Type:X-SES-RECEIPT;'
                    },
                    {
                        'name': 'DKIM-Signature',
                        'value': 'v=1; a=rsa-sha256; c=relaxed/relaxed; d=sendgrid.net; h=from:reply-to:subject:mime-version:content-type:content-transfer-encoding:to:list-unsubscribe; s=smtpapi; bh=xX5Mm956DGkkwJpwC+XRObo+5yNn50ygA4tS7XzGJyk=; b=NwZeSkh8+bgQIOSNBflLYuI68AQ138TfLEG3tLaqTl5fwA4dSr3n/467ynNxh65dM4np5mqHVHDnpSmBvm/8iUHUsByF5uiE/lGkblcJBiacZiI/30H2pOkRZEjudeyXGHjlI6TlocKNHihmEJzBgZH95JK8nDMoPrW5zamCTbY='
                    },
                    {
                        'name': 'Received',
                        'value': 'by filterdrecv-p3las1-cb48d7cc9-w2z5b with SMTP id filterdrecv-p3las1-cb48d7cc9-w2z5b-19-5E7CA6EA-54 2020-03-26 12:58:18.811756328 +0000 UTC m=+42648.940976906'
                    },
                    {
                        'name': 'Received',
                        'value': 'from g5search.com (unknown) by ismtpd0102p1mdw1.sendgrid.net (SG) with ESMTP id brnDfK6mTtCXT1D-YVGwAw for <bellagio.mt@dwell.io>; Thu, 26 Mar 2020 12:58:18.698 +0000 (UTC)'
                    },
                    {
                        'name': 'Date',
                        'value': 'Thu, 26 Mar 2020 12:58:18 +0000 (UTC)'
                    },
                    {
                        'name': 'From',
                        'value': 'no-reply@g5searchmarketing.com'
                    },
                    {
                        'name': 'Reply-To',
                        'value': 'no-reply@g5searchmarketing.com'
                    },
                    {
                        'name': 'Message-ID',
                        'value': '<5e7ca6ea7da16_13fdadb1ab620132218da@emails-sidekiq-general-workers-797586497-b79tt.mail>'
                    },
                    {
                        'name': 'Subject',
                        'value': '‐‐ New Email Lead For Bellagio --'
                    },
                    {
                        'name': 'Mime-Version',
                        'value': '1.0'
                    },
                    {
                        'name': 'Content-Type',
                        'value': 'text/plain; charset=us-ascii'
                    },
                    {
                        'name': 'Content-Transfer-Encoding',
                        'value': '7bit'
                    },
                    {
                        'name': 'sendgrid-category',
                        'value': 'salesforce'
                    },
                    {
                        'name': 'disable-unsubscribe',
                        'value': 'true'
                    },
                    {
                        'name': 'unique-sendgrid-args',
                        'value': "{\"lead_uid\"=>\"https://client-leads.g5marketingcloud.com/locations/g5-cl-1ilppk5n2b-bellagio/leads/13241667\", \"location_urn\"=>\"g5-cl-1ilppk5n2b-bellagio\"}"
                    },
                    {
                        'name': 'X-SG-EID',
                        'value': 'nNFctdm0BWd6iTjLSzehWRHF1TEb0Z59fbRmcrBjRN6cLEyrL94lVubqXy/GqxMi7/w4YBtrxN4KAynAWjS1Iue3VSIylOOIhZ1R62Iv8t/QIisJQKLu/QNulWIMQ1skUNyHLLgOaYjM4qGVU2r5XSoReyfR3DaIXyg1xqCBYrgZnunvEpX5Ps6AWsWU0Fw7qV+yECcOAM+/Watk93pSxJMNpg77iL8vYWxQv0oYxmQ='
                    },
                    {
                        'name': 'To',
                        'value': 'bellagio.mt@dwell.io'
                    },
                    {
                        'name': 'List-Unsubscribe',
                        'value': '<mailto:unsubscribe@sendgrid.net?subject=https://u7053930.ct.sendgrid.net/wf/unsubscribe*q*upn=z9-2BKfNPSabvN-2BBwXICZdpYAGKrZI-2FxPsGIcx-2F0BykacAMHB-2FhgTtdI5s7o30gm1dLPqSSANRJfp1h-2BjJrgrjzFX-2FUJHn3LFOpGKsF6w-2Fd1nGnSBom1mrLdhwlo09xZkWxuz878xOobcAW5x1TuSpR2-2FrfTd8pEm9DuHhEFAKw0yLD6XgFFqWMUN-2FC9FnGPIDPYzeRgF0Y8CFLd2GahfbOavjUjINuSA19Q24N5mHdxvwwm-2BPFnjQhNhSL1tYv2Fm>'
                    }
                ],
                'commonHeaders': {
                    'returnPath': 'bounces+7053930-4552-bellagio.mt=dwell.io@sendgrid.net',
                    'from': [
                        'no-reply@g5searchmarketing.com'
                    ],
                    'replyTo': [
                        'no-reply@g5searchmarketing.com'
                    ],
                    'date': 'Thu, 26 Mar 2020 12:58:18 +0000 (UTC)',
                    'to': [
                        'bellagio.mt@dwell.io'
                    ],
                    'messageId': '<5e7ca6ea7da16_13fdadb1ab620132218da@emails-sidekiq-general-workers-797586497-b79tt.mail>',
                    'subject': '‐‐ New Email Lead For Bellagio --'
                }
            },
            'receipt': {
                'timestamp': '2020-03-26T12:58:19.827Z',
                'processingTimeMillis': 410,
                'recipients': [
                    'bellagio.mt@dwell.io'
                ],
                'spamVerdict': {
                    'status': 'DISABLED'
                },
                'virusVerdict': {
                    'status': 'DISABLED'
                },
                'spfVerdict': {
                    'status': 'PASS'
                },
                'dkimVerdict': {
                    'status': 'GRAY'
                },
                'dmarcVerdict': {
                    'status': 'FAIL'
                },
                'action': {
                    'type': 'SNS',
                    'topicArn': 'arn:aws:sns:us-east-1:186092620714:Dwell-Email-Receiving',
                    'encoding': 'UTF8'
                },
                'dmarcPolicy': 'none'
            },
            'content': "Return-Path: <bounces+7053930-4552-bellagio.mt=dwell.io@sendgrid.net>\r\nReceived: from o3.email.g5search.com (o3.email.g5search.com [149.72.164.173])\r\n by inbound-smtp.us-east-1.amazonaws.com with SMTP id 7j11v3stsermtr6fu57narbcj9tjdbs8i7jnaio1\r\n for bellagio.mt@dwell.io;\r\n Thu, 26 Mar 2020 12:58:19 +0000 (UTC)\r\nReceived-SPF: pass (spfCheck: domain of sendgrid.net designates 149.72.164.173 as permitted sender) client-ip=149.72.164.173; envelope-from=bounces+7053930-4552-bellagio.mt=dwell.io@sendgrid.net; helo=o3.email.g5search.com;\r\nAuthentication-Results: amazonses.com;\r\n spf=pass (spfCheck: domain of sendgrid.net designates 149.72.164.173 as permitted sender) client-ip=149.72.164.173; envelope-from=bounces+7053930-4552-bellagio.mt=dwell.io@sendgrid.net; helo=o3.email.g5search.com;\r\n dkim=pass header.i=@sendgrid.net;\r\n dmarc=fail header.from=g5searchmarketing.com;\r\nX-SES-RECEIPT: AEFBQUFBQUFBQUFGU2dsTFJ4UXV3dUJqR1dWdjU5K0lGKzh3SFFZK1dEcXFHWGxka1RXWmtQUEk3SEdsU0lGWWQvY0hVUkJCL0tyTTMrTnRjR3NsT0pLU08raHROZnRaalRoTEIxR3R3bmRqOEcxMlJEYTVRTzN2NU1URG1ZTGwvOC9ibGNFbDBKRHZZWGtuMjFkanpyVC9ob1dkbklqOVZkVHBDRkNxZVpmdlJuNTd2RkVBRGRTTCtiVkZETnJRbVhrR1lZSkEvakNwSUgwbnlPeWFKL2ZLc0xiREFwQ0lyTHIwYkNMb1o4bUdSY1pBQUE2dnpmWGl5b2VVU0hQYVAvSEU0NzZYVDJJTXVpN0dpd3hJYTBuVThiTkJ2TDRIalJQbFN6RHQ2eUR0OFNWL1gxT2dzVFpOdzBaa0xKTEYxaytrQ1QzWlJlS0lrLzlXNVhRMmE3eUhpSFZUb0lYU0ZNeW5zaW1nWmw0VXY5Rk5MUlBvN3JRPT0=\r\nX-SES-DKIM-SIGNATURE: a=rsa-sha256; q=dns/txt; b=dnYWYc5siEUiO3Ym0/v1/XAycS5bvqJOFc/HpPjVWKcXG9FNBawgvS3Ot46R6MCevkYovuYln2MSk/ySVL7SeHFiTg7u4BouWyY1RDc6ZNjM4YRIXvCxjOkUr52I3ffkg9YK4emTgZNTeLzA8Ci13AD5Irozqx8dtC2cx1uf36o=; c=relaxed/simple; s=224i4yxa5dv7c2xz3womw6peuasteono; d=amazonses.com; t=1585227500; v=1; bh=DtUtp4OKT2ARCy2ZrHp/RJGanBGfYkciIx82Gx2G9wU=; h=From:To:Cc:Bcc:Subject:Date:Message-ID:MIME-Version:Content-Type:X-SES-RECEIPT;\r\nDKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=sendgrid.net;\r\n\th=from:reply-to:subject:mime-version:content-type:\r\n\tcontent-transfer-encoding:to:list-unsubscribe;\r\n\ts=smtpapi; bh=xX5Mm956DGkkwJpwC+XRObo+5yNn50ygA4tS7XzGJyk=;\r\n\tb=NwZeSkh8+bgQIOSNBflLYuI68AQ138TfLEG3tLaqTl5fwA4dSr3n/467ynNxh65dM4np\r\n\t5mqHVHDnpSmBvm/8iUHUsByF5uiE/lGkblcJBiacZiI/30H2pOkRZEjudeyXGHjlI6Tloc\r\n\tKNHihmEJzBgZH95JK8nDMoPrW5zamCTbY=\r\nReceived: by filterdrecv-p3las1-cb48d7cc9-w2z5b with SMTP id filterdrecv-p3las1-cb48d7cc9-w2z5b-19-5E7CA6EA-54\r\n        2020-03-26 12:58:18.811756328 +0000 UTC m=+42648.940976906\r\nReceived: from g5search.com (unknown)\r\n\tby ismtpd0102p1mdw1.sendgrid.net (SG)\r\n\twith ESMTP id brnDfK6mTtCXT1D-YVGwAw\r\n\tfor <bellagio.mt@dwell.io>;\r\n\tThu, 26 Mar 2020 12:58:18.698 +0000 (UTC)\r\nDate: Thu, 26 Mar 2020 12:58:18 +0000 (UTC)\r\nFrom: no-reply@g5searchmarketing.com\r\nReply-To: no-reply@g5searchmarketing.com\r\nMessage-ID: <5e7ca6ea7da16_13fdadb1ab620132218da@emails-sidekiq-general-workers-797586497-b79tt.mail>\r\nSubject: =?UTF-8?B?4oCQ4oCQ?= New Email Lead For Bellagio --\r\nMime-Version: 1.0\r\nContent-Type: text/plain; charset=us-ascii\r\nContent-Transfer-Encoding: 7bit\r\nsendgrid-category: salesforce\r\ndisable-unsubscribe: true\r\nunique-sendgrid-args: {\"lead_uid\"=>\"https://client-leads.g5marketingcloud.com/locations/g5-cl-1ilppk5n2b-bellagio/leads/13241667\",\r\n \"location_urn\"=>\"g5-cl-1ilppk5n2b-bellagio\"}\r\nX-SG-EID: \r\n =?us-ascii?Q?nNFctdm0BWd6iTjLSzehWRHF1TEb0Z59fbRmcrBjRN6cLEyrL94lVubqXy=2FGqx?=\r\n =?us-ascii?Q?Mi7=2Fw4YBtrxN4KAynAWjS1Iue3VSIylOOIhZ1R6?=\r\n =?us-ascii?Q?2Iv8t=2FQIisJQKLu=2FQNulWIMQ1skUNyHLLgOaYjM?=\r\n =?us-ascii?Q?4qGVU2r5XSoReyfR3DaIXyg1xqCBYrgZnunvEpX?=\r\n =?us-ascii?Q?5Ps6AWsWU0Fw7qV+yECcOAM+=2FWatk93pSxJMNpg?=\r\n =?us-ascii?Q?77iL8vYWxQv0oYxmQ=3D?=\r\nTo: bellagio.mt@dwell.io\r\nList-Unsubscribe: \r\n =?us-ascii?Q?=3Cmailto=3Aunsubscribe=40sendgrid=2Enet=3Fsubject=3Dhttps=3A=2F=2Fu7053930=2Ect=2Es?=\r\n =?us-ascii?Q?endgrid=2Enet=2Fwf=2Funsubscribe*q*upn=3Dz9-2BK?=\r\n =?us-ascii?Q?fNPSabvN-2BBwXICZdpYAGKrZI-2FxPsGIcx-2F?=\r\n =?us-ascii?Q?0BykacAMHB-2FhgTtdI5s7o30gm1dLPqSSANRJf?=\r\n =?us-ascii?Q?p1h-2BjJrgrjzFX-2FUJHn3LFOpGKsF6w-2Fd1n?=\r\n =?us-ascii?Q?GnSBom1mrLdhwlo09xZkWxuz878xOobcAW5x1Tu?=\r\n =?us-ascii?Q?SpR2-2FrfTd8pEm9DuHhEFAKw0yLD6XgFFqWMUN?=\r\n =?us-ascii?Q?-2FC9FnGPIDPYzeRgF0Y8CFLd2GahfbOavjUjIN?=\r\n =?us-ascii?Q?uSA19Q24N5mHdxvwwm-2BPFnjQhNhSL1tYv2Fm=3E?=\r\n\r\nLocation: Bellagio\r\nFirst Name: Melissa \r\nLast Name: Kling\r\nAddress: \r\nCity: \r\nState: \r\nZip: \r\nCountry: \r\nPhone: 480-465-2870\r\nEmail Address: mkmissy01@gmail.com\r\nReservation Date: \r\nRental Rate: \r\nUnit Size: \r\nUnit External ID:  \r\nSpecial ID: \r\nComments: Test comment \r\n\r\nIf you would like to unsubscribe and stop receiving these emails click here: https://u7053930.ct.sendgrid.net/wf/unsubscribe?upn=z9-2BKfNPSabvN-2BBwXICZdpYAGKrZI-2FxPsGIcx-2F0BykacAMHB-2FhgTtdI5s7o30gm1dovFLFAdu-2BuMseYyS5zECsGKuDbCp-2FgCzulslGQH1M4iqSEF0AsNM6IIKyyxHEUWzTVtlfuZKHbwAKXkjEFDlkbVi-2BNvHze3XbeZpqLvstT-2BdwK1Isfdr4p2ByD8oSa1AKEHhP-2BsCGaMR5tjbE4fcA2cIG9kp96rpoh4P23UVZKFVV-2BoRL67G2o4oQZ5Zl75X.\r\n"
        }
        AL_email_body = {
            'notificationType': 'Received',
            'mail': {
                'timestamp': '2020-03-24T18:25:37.846Z',
                'source': 'bounces+907926-a400-bellagio.apartmentlist=dwell.io@em.apartmentlist.com',
                'messageId': 'offsvj4kq4adlsnnmkimp7547vf9648gv25hi9o1',
                'destination': [
                    'bellagio.apartmentlist@dwell.io'
                ],
                'headersTruncated': False,
                'headers': [
                    {
                        'name': 'Return-Path',
                        'value': '<bounces+907926-a400-bellagio.apartmentlist=dwell.io@em.apartmentlist.com>'
                    },
                    {
                        'name': 'Received',
                        'value': 'from o3.em.apartmentlist.com (o3.em.apartmentlist.com [167.89.20.184]) by inbound-smtp.us-east-1.amazonaws.com with SMTP id offsvj4kq4adlsnnmkimp7547vf9648gv25hi9o1 for bellagio.apartmentlist@dwell.io; Tue, 24 Mar 2020 18:25:37 +0000 (UTC)'
                    },
                    {
                        'name': 'Received-SPF',
                        'value': 'pass (spfCheck: domain of em.apartmentlist.com designates 167.89.20.184 as permitted sender) client-ip=167.89.20.184; envelope-from=bounces+907926-a400-bellagio.apartmentlist=dwell.io@em.apartmentlist.com; helo=o3.em.apartmentlist.com;'
                    },
                    {
                        'name': 'Authentication-Results',
                        'value': 'amazonses.com; spf=pass (spfCheck: domain of em.apartmentlist.com designates 167.89.20.184 as permitted sender) client-ip=167.89.20.184; envelope-from=bounces+907926-a400-bellagio.apartmentlist=dwell.io@em.apartmentlist.com; helo=o3.em.apartmentlist.com; dkim=permerror header.i=@apartmentlist.com; dmarc=pass header.from=apartmentlist.com;'
                    },
                    {
                        'name': 'X-SES-RECEIPT',
                        'value': 'AEFBQUFBQUFBQUFGMmdFUHdzLzk5emhHWEhmY3dqYnNNSkdvYkpQdTBZMGFRdTNyUWVjZDBwTCtIVHVmbUNvWVR5TnZrdzRHcTNPczdLTGRyUGxKSG1pUnRPVXl3U3o1ZmVRb3daTWVUNnA2ZUtTdWE1dzZ4TTZHbTIwMjZQU1dXYVpKbTYwcm91NS8rOEhzRnJLUWdFb1NaNzZLcDNuMnFWNTA0M0hTL0gwRDZ0L3dsL1lZZ1R3MENMcVhOWlpZTzlZWnBSWlBpekpjbnhGM1dJem9FdE5YWkpOUnMzTEpyNktGU1NTbW1Kb3E4QTN0RlJFNy9UbTdkQ1J3aFY3WFBCV2R6c0dYRlNRRFZlQWMrYlFrVURseURBaWRZQ2VPQTBqdXdqVUl0eEdlb2pVdmFrS0Jua0d0QWpBRHo3MGJUMkszWDJtQk92MmVNaVVubUgvaTk5NitGcUdiVncyblVwcW44OTBWZWZ6anRUNjVHUTJSbU1vU2xuRUQ3VjJVYUJtR2d1ZGxoMHNNeW9zc3poVWh4ZFo5cVlWZzAwcm1i'
                    },
                    {
                        'name': 'X-SES-DKIM-SIGNATURE',
                        'value': 'a=rsa-sha256; q=dns/txt; b=A/n74nw2+lznZLqiuCsZbD4BwGbijibcavxmWpjNU3CoUKGE87keP8rrjkoer7HNpc/cDwrEDhbpbM8NCch1iE4bxtAxSdOwCPlSAuwZ9Ak/uW0vmYqjJIiQMxR8J9F8xXRF103p65owVwDWxbKPqMfftIyJM7BAC/sj3/kTXUQ=; c=relaxed/simple; s=224i4yxa5dv7c2xz3womw6peuasteono; d=amazonses.com; t=1585074337; v=1; bh=0ilvwOv4TpmE+7GIkvaPXjYsqBwBotsbedecGwZ+niw=; h=From:To:Cc:Bcc:Subject:Date:Message-ID:MIME-Version:Content-Type:X-SES-RECEIPT;'
                    },
                    {
                        'name': 'DKIM-Signature',
                        'value': 'v=1; a=rsa-sha256; c=relaxed/relaxed; d=apartmentlist.com; h=content-transfer-encoding:content-type:from:mime-version:to:subject; s=s1; bh=UXa82j1w276Y0BmR9xoB/jHq8OPPllz+2dZbhu6/xr8=; b=fNyppvVyaSBEDLUsRBLieCGgZSfovR8cJtm5G+VcuxDj4kVVtxFvemDF/CsPjRzCoS4WYrrM7rrHnqksPr9InnujIG4q2ASFiuNUMFzOAZCfAM+WWAOqLmOXthx8cd4wjZ20sm3tEOSl2dzyRXFhcWxdnv/pfkz2oUiycbiBza4='
                    },
                    {
                        'name': 'Received',
                        'value': 'by filter1565p1mdw1.sendgrid.net with SMTP id filter1565p1mdw1-4808-5E7A50A0-27 2020-03-24 18:25:36.782267034 +0000 UTC m=+89994.273275040'
                    },
                    {
                        'name': 'Received',
                        'value': 'from OTA3OTI2 (unknown) by ismtpd0017p1iad2.sendgrid.net (SG) with HTTP id t9tQjtluRDKq899FyYuniQ Tue, 24 Mar 2020 18:25:36.845 +0000 (UTC)'
                    },
                    {
                        'name': 'Content-Transfer-Encoding',
                        'value': 'quoted-printable'
                    },
                    {
                        'name': 'Content-Type',
                        'value': 'text/plain; charset=UTF-8'
                    },
                    {
                        'name': 'Date',
                        'value': 'Tue, 24 Mar 2020 18:25:36 +0000 (UTC)'
                    },
                    {
                        'name': 'From',
                        'value': "\"Apartment List Interests\" <interests@apartmentlist.com>"
                    },
                    {
                        'name': 'Mime-Version',
                        'value': '1.0'
                    },
                    {
                        'name': 'To',
                        'value': 'bellagio.apartmentlist@dwell.io'
                    },
                    {
                        'name': 'Message-ID',
                        'value': '<t9tQjtluRDKq899FyYuniQ@ismtpd0017p1iad2.sendgrid.net>'
                    },
                    {
                        'name': 'Subject',
                        'value': '--New Email Lead For ##San Palmilla by Mark-Taylor##--'
                    },
                    {
                        'name': 'X-SG-EID',
                        'value': 'yQQQDc/35DObzYT6q5Vh9c9u0lg+1ucc9dqjARJ3yaA0bDiUosmlSyS/TYSzDrvnn+jUHW8g6GbpAh LaQs3upVh7I5G6/TqH6F9HtFYgAb+3gTzxyM+MOpbsod1MxLr98JZcPLSzG9+hoB7aru2B94MSyyZF VoQFPgdgDKOQe1xX48CFFseK7LSiMlLhk4HeqoVzmynE+IGhjG10VAFCu2s4bXEyBFbBHl+V15Cl+R U0maYCoxwjE6INmo+SpZ6FRTCNGnA+3pQULOkohPLONQ=='
                    },
                    {
                        'name': 'X-SG-ID',
                        'value': 'Omt26qN7xZsCf815g2j4Mk6WpZvW5sfJBCG46GdoQI9PlrhHuEWekwyOqeXDS4VXY/s0JV2wTJ/wyM vgo4+INhvmV71/zrSG8vs9fcBqmq0auHFF7L1Fx2iYvGEj3NeXGJkQqbw3PODcP2d/YZgPlEWh4nhT F7MRw2aR0LMNVWpj1fIXCFx26J4jwvvXRh/b2+W/F7vsr0wMS3O0LkT6ly5wXo1tPbJLkLwfo3FQvo F4N1PWCsfay8u22gHkRkWx7DKRG/FlsHGjkEiyBLrC5FJgcP45ueFhcLd8KnEu43E='
                    }
                ],
                'commonHeaders': {
                    'returnPath': 'bounces+907926-a400-bellagio.apartmentlist=dwell.io@em.apartmentlist.com',
                    'from': [
                        'Apartment List Interests <interests@apartmentlist.com>'
                    ],
                    'date': 'Tue, 24 Mar 2020 18:25:36 +0000 (UTC)',
                    'to': [
                        'bellagio.apartmentlist@dwell.io'
                    ],
                    'messageId': '<t9tQjtluRDKq899FyYuniQ@ismtpd0017p1iad2.sendgrid.net>',
                    'subject': '--New Email Lead For ##San Palmilla by Mark-Taylor##--'
                }
            },
            'receipt': {
                'timestamp': '2020-03-24T18:25:37.846Z',
                'processingTimeMillis': 260,
                'recipients': [
                    'bellagio.apartmentlist@dwell.io'
                ],
                'spamVerdict': {
                    'status': 'DISABLED'
                },
                'virusVerdict': {
                    'status': 'DISABLED'
                },
                'spfVerdict': {
                    'status': 'PASS'
                },
                'dkimVerdict': {
                    'status': 'PROCESSING_FAILED'
                },
                'dmarcVerdict': {
                    'status': 'PASS'
                },
                'action': {
                    'type': 'SNS',
                    'topicArn': 'arn:aws:sns:us-east-1:186092620714:Dwell-Email-Receiving',
                    'encoding': 'UTF8'
                }
            },
            'content': "Return-Path: <bounces+907926-a400-bellagio.apartmentlist=dwell.io@em.apartmentlist.com>\r\nReceived: from o3.em.apartmentlist.com (o3.em.apartmentlist.com [167.89.20.184])\r\n by inbound-smtp.us-east-1.amazonaws.com with SMTP id offsvj4kq4adlsnnmkimp7547vf9648gv25hi9o1\r\n for bellagio.apartmentlist@dwell.io;\r\n Tue, 24 Mar 2020 18:25:37 +0000 (UTC)\r\nReceived-SPF: pass (spfCheck: domain of em.apartmentlist.com designates 167.89.20.184 as permitted sender) client-ip=167.89.20.184; envelope-from=bounces+907926-a400-bellagio.apartmentlist=dwell.io@em.apartmentlist.com; helo=o3.em.apartmentlist.com;\r\nAuthentication-Results: amazonses.com;\r\n spf=pass (spfCheck: domain of em.apartmentlist.com designates 167.89.20.184 as permitted sender) client-ip=167.89.20.184; envelope-from=bounces+907926-a400-bellagio.apartmentlist=dwell.io@em.apartmentlist.com; helo=o3.em.apartmentlist.com;\r\n dkim=permerror header.i=@apartmentlist.com;\r\n dmarc=pass header.from=apartmentlist.com;\r\nX-SES-RECEIPT: AEFBQUFBQUFBQUFGMmdFUHdzLzk5emhHWEhmY3dqYnNNSkdvYkpQdTBZMGFRdTNyUWVjZDBwTCtIVHVmbUNvWVR5TnZrdzRHcTNPczdLTGRyUGxKSG1pUnRPVXl3U3o1ZmVRb3daTWVUNnA2ZUtTdWE1dzZ4TTZHbTIwMjZQU1dXYVpKbTYwcm91NS8rOEhzRnJLUWdFb1NaNzZLcDNuMnFWNTA0M0hTL0gwRDZ0L3dsL1lZZ1R3MENMcVhOWlpZTzlZWnBSWlBpekpjbnhGM1dJem9FdE5YWkpOUnMzTEpyNktGU1NTbW1Kb3E4QTN0RlJFNy9UbTdkQ1J3aFY3WFBCV2R6c0dYRlNRRFZlQWMrYlFrVURseURBaWRZQ2VPQTBqdXdqVUl0eEdlb2pVdmFrS0Jua0d0QWpBRHo3MGJUMkszWDJtQk92MmVNaVVubUgvaTk5NitGcUdiVncyblVwcW44OTBWZWZ6anRUNjVHUTJSbU1vU2xuRUQ3VjJVYUJtR2d1ZGxoMHNNeW9zc3poVWh4ZFo5cVlWZzAwcm1i\r\nX-SES-DKIM-SIGNATURE: a=rsa-sha256; q=dns/txt; b=A/n74nw2+lznZLqiuCsZbD4BwGbijibcavxmWpjNU3CoUKGE87keP8rrjkoer7HNpc/cDwrEDhbpbM8NCch1iE4bxtAxSdOwCPlSAuwZ9Ak/uW0vmYqjJIiQMxR8J9F8xXRF103p65owVwDWxbKPqMfftIyJM7BAC/sj3/kTXUQ=; c=relaxed/simple; s=224i4yxa5dv7c2xz3womw6peuasteono; d=amazonses.com; t=1585074337; v=1; bh=0ilvwOv4TpmE+7GIkvaPXjYsqBwBotsbedecGwZ+niw=; h=From:To:Cc:Bcc:Subject:Date:Message-ID:MIME-Version:Content-Type:X-SES-RECEIPT;\r\nDKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; \r\n\td=apartmentlist.com; \r\n\th=content-transfer-encoding:content-type:from:mime-version:to:subject; \r\n\ts=s1; bh=UXa82j1w276Y0BmR9xoB/jHq8OPPllz+2dZbhu6/xr8=; b=fNyppvV\r\n\tyaSBEDLUsRBLieCGgZSfovR8cJtm5G+VcuxDj4kVVtxFvemDF/CsPjRzCoS4WYrr\r\n\tM7rrHnqksPr9InnujIG4q2ASFiuNUMFzOAZCfAM+WWAOqLmOXthx8cd4wjZ20sm3\r\n\ttEOSl2dzyRXFhcWxdnv/pfkz2oUiycbiBza4=\r\nReceived: by filter1565p1mdw1.sendgrid.net with SMTP id filter1565p1mdw1-4808-5E7A50A0-27\r\n        2020-03-24 18:25:36.782267034 +0000 UTC m=+89994.273275040\r\nReceived: from OTA3OTI2 (unknown)\r\n\tby ismtpd0017p1iad2.sendgrid.net (SG) with HTTP id t9tQjtluRDKq899FyYuniQ\r\n\tTue, 24 Mar 2020 18:25:36.845 +0000 (UTC)\r\nContent-Transfer-Encoding: quoted-printable\r\nContent-Type: text/plain; charset=UTF-8\r\nDate: Tue, 24 Mar 2020 18:25:36 +0000 (UTC)\r\nFrom: \"Apartment List Interests\" <interests@apartmentlist.com>\r\nMime-Version: 1.0\r\nTo: bellagio.apartmentlist@dwell.io\r\nMessage-ID: <t9tQjtluRDKq899FyYuniQ@ismtpd0017p1iad2.sendgrid.net>\r\nSubject: --New Email Lead For ##San Palmilla by Mark-Taylor##--\r\nX-SG-EID: yQQQDc/35DObzYT6q5Vh9c9u0lg+1ucc9dqjARJ3yaA0bDiUosmlSyS/TYSzDrvnn+jUHW8g6GbpAh\r\n LaQs3upVh7I5G6/TqH6F9HtFYgAb+3gTzxyM+MOpbsod1MxLr98JZcPLSzG9+hoB7aru2B94MSyyZF\r\n VoQFPgdgDKOQe1xX48CFFseK7LSiMlLhk4HeqoVzmynE+IGhjG10VAFCu2s4bXEyBFbBHl+V15Cl+R\r\n U0maYCoxwjE6INmo+SpZ6FRTCNGnA+3pQULOkohPLONQ==\r\nX-SG-ID: Omt26qN7xZsCf815g2j4Mk6WpZvW5sfJBCG46GdoQI9PlrhHuEWekwyOqeXDS4VXY/s0JV2wTJ/wyM\r\n vgo4+INhvmV71/zrSG8vs9fcBqmq0auHFF7L1Fx2iYvGEj3NeXGJkQqbw3PODcP2d/YZgPlEWh4nhT\r\n F7MRw2aR0LMNVWpj1fIXCFx26J4jwvvXRh/b2+W/F7vsr0wMS3O0LkT6ly5wXo1tPbJLkLwfo3FQvo\r\n F4N1PWCsfay8u22gHkRkWx7DKRG/FlsHGjkEiyBLrC5FJgcP45ueFhcLd8KnEu43E=\r\n\r\nFirst Name: Eshekiah\r\nLast Name: Herron\r\nAddress:\r\nAddress2:\r\nCity:\r\nState:\r\nZip:\r\nHome Phone: 4144919567\r\nCell Phone:=20\r\nWork Phone:\r\nService: Apartment Tour\r\nDate:\r\nStart Time:\r\nEnd Time:\r\nEmail Address: soready2bme@gmail.com\r\nLead Channel: Apartment List\r\nLead Priority: 1\r\nDesired Move In: 05/22/2020\r\nDesired Lease Term: 12\r\nDesired Unit Type: 3 bed,  bath\r\nDesired Bedrooms: 3\r\nDesired Bathrooms:=20\r\nPets: No\r\nPet Types:=20\r\nComments: New Lead from Eshekiah   |   MOVE-IN: 05/22/2020 (59 days away!)\r\n--------\r\nBEDS: 3   |   BUDGET: $1,500   |   PETS: Did not specify.   |   AMENITIES: =\r\nIn unit laundry, Parking, Hardwood floors, Dishwasher, Air conditioning   |=\r\n   QUALIFICATIONS: No prior evictions, meets your income requirement\r\n"
        }
        Yelp_email_body = {
            'notificationType': 'Received',
            'mail': {
                'timestamp': '2020-03-19T15:24:21.482Z',
                'source': 'sari@govyrl.com',
                'messageId': '5t9lv1dumdanru3rusm47prnaurfl1h81ogr7381',
                'destination': [
                    'bellagio.yelp@dwell.io'
                ],
                'headersTruncated': False,
                'headers': [
                    {
                        'name': 'Return-Path',
                        'value': '<sari@govyrl.com>'
                    },
                    {
                        'name': 'Received',
                        'value': 'from smtp07-ia2-sp4.mta.salesforce.com (smtp07-ia2-sp4.mta.salesforce.com [13.110.14.214]) by inbound-smtp.us-east-1.amazonaws.com with SMTP id 5t9lv1dumdanru3rusm47prnaurfl1h81ogr7381 for bellagio.yelp@dwell.io; Thu, 19 Mar 2020 15:24:21 +0000 (UTC)'
                    },
                    {
                        'name': 'Received-SPF',
                        'value': 'pass (spfCheck: domain of govyrl.com designates 13.110.14.214 as permitted sender) client-ip=13.110.14.214; envelope-from=sari@govyrl.com; helo=smtp07-ia2-sp4.mta.salesforce.com;'
                    },
                    {
                        'name': 'Authentication-Results',
                        'value': 'amazonses.com; spf=pass (spfCheck: domain of govyrl.com designates 13.110.14.214 as permitted sender) client-ip=13.110.14.214; envelope-from=sari@govyrl.com; helo=smtp07-ia2-sp4.mta.salesforce.com; dkim=pass header.i=@govyrl.com; dmarc=none header.from=govyrl.com;'
                    },
                    {
                        'name': 'X-SES-RECEIPT',
                        'value': 'AEFBQUFBQUFBQUFHVkxONSt0VGFXd0pyODJOZzZ3ZmI5bW1UUG5zVDBSTHErNUc1NWZ6aUh3dmlIMlBLN2FIUFF5WFMyWDg4cW1qeGhzemZWcFdmOStqcmpTdFNKcGxVZ2pSRHEyK3IyS0hxSjFLWUw2dDZhMlBYOG1zRllPVGdpK3AxQ29OTTdFMkJubnU4N2dWc2J4czdsZFhmZ0oyeGtpN2RZOFRCODBaMDl2RVI0ako5NDl5dzFKLzJpMmN3VmdhR2pncTdsVU0rbC9CcW1tc3draytiV1F6a2JqZnZJRHFnZ21KVzJHSUE0eWs4bnpSMGFhUCtoREFxYUZrQmZsUHhiQVg3NkdCeGtNemVIamJ2Z2lFOXZDK29mSmpvQ01hK0QwVFJtQ1ZMN0tlSkVTMjFOY0E9PQ=='
                    },
                    {
                        'name': 'X-SES-DKIM-SIGNATURE',
                        'value': 'a=rsa-sha256; q=dns/txt; b=koZawE6QkQhZjDgwtMrjfgEWU196FIGUkk6gFuwlZKcgPI50V7/z5nA8BTBdYcBICQyhpcaTAq3Eeucob5Wl4DGHamo+k9tHiDFvy1h3datSZwyIiIIRmmzw7vYs3KwebXM4R/4BxSNRED28c47NOJwwUL5Fb9HCc96Htb+aTAY=; c=relaxed/simple; s=224i4yxa5dv7c2xz3womw6peuasteono; d=amazonses.com; t=1584631461; v=1; bh=+jOGqVN31Fhp5yMcawNvjY7SCUds2pCGfyZZNh7b6B4=; h=From:To:Cc:Bcc:Subject:Date:Message-ID:MIME-Version:Content-Type:X-SES-RECEIPT;'
                    },
                    {
                        'name': 'Return-Path',
                        'value': '<sari@govyrl.com>'
                    },
                    {
                        'name': 'DKIM-Signature',
                        'value': 'v=1; a=rsa-sha256; c=relaxed/simple; d=govyrl.com; s=office3652; t=1584631461; bh=+jOGqVN31Fhp5yMcawNvjY7SCUds2pCGfyZZNh7b6B4=; h=Date:From:To:Subject:MIME-Version:Content-Type; b=fio78HyDSOV9aqgYXTI3B00NoH/XMbuLE56eQlSb7a3PZ/nTMt26+32WLDjMkogwGQLpBL1N93a8g0K/WRx6wOc+h8b+kKKHBZWS/JDzdJPjxJqDV9MPzxfLLNEVvZSnEKghGZm8vwQsOBjXyKIXWvnsX4bUPzAX0bcofzpEMaoihALD6CetETnfeRMVQXp+iHpvXRcS+ktJ95Avg8/BfLlXkpQJE9BHz7t5LzRwODmpC0NPsMS/pDyZq96m9N/h+rdCJKvI2+8PeD5KocQ4yWAlUGJX9rgtFrUJjufI1QEh9sHHJcnJx8kIxmJmcyrRK14wNYOYdLA/4PtW0iTYbg=='
                    },
                    {
                        'name': 'Authentication-Results',
                        'value': "mx1-ia2-sp4.mta.salesforce.com x-tls.subject=\"/C=US/ST=California/L=San Francisco/O=salesforce.com, inc./OU=0:app;1:ia2;2:ia2-sp4;3:na142;4:prod/CN=na142-app1-4-ia2.ops.sfdc.net\"; auth=pass (cipher=ECDHE-RSA-AES256-GCM-SHA384)"
                    },
                    {
                        'name': 'Received',
                        'value': "from [10.176.14.22] ([10.176.14.22:36814] helo=na142-app1-4-ia2.ops.sfdc.net) by mx1-ia2-sp4.mta.salesforce.com (envelope-from <sari@govyrl.com>) (ecelerity 4.2.38.62368 r(Core:release/4.2.38.0)) with ESMTPS (cipher=ECDHE-RSA-AES256-GCM-SHA384 subject=\"/C=US/ST=California/L=San Francisco/O=salesforce.com, inc./OU=0:app;1:ia2;2:ia2-sp4;3:na142;4:prod/CN=na142-app1-4-ia2.ops.sfdc.net\")  id 5E/F0-44432-5AE837E5; Thu, 19 Mar 2020 15:24:21 +0000"
                    },
                    {
                        'name': 'Date',
                        'value': 'Thu, 19 Mar 2020 15:24:21 +0000 (GMT)'
                    },
                    {
                        'name': 'From',
                        'value': 'VYRL Watch <sari@govyrl.com>'
                    },
                    {
                        'name': 'To',
                        'value': "\"bellagio.yelp@dwell.io\" <bellagio.yelp@dwell.io>"
                    },
                    {
                        'name': 'Message-ID',
                        'value': '<ag-hz000000000000000000000000000000000000000000000Q7G5GL00EJfHjduZRPCGrlgFmwTYiA@sfdc.net>'
                    },
                    {
                        'name': 'Subject',
                        'value': 'New Email Lead For The Halsten @ Chauncey Lane'
                    },
                    {
                        'name': 'MIME-Version',
                        'value': '1.0'
                    },
                    {
                        'name': 'Content-Type',
                        'value': "multipart/mixed;  boundary=\"----=_Part_3681_1435345900.1584631461335\""
                    },
                    {
                        'name': 'X-Priority',
                        'value': '3'
                    },
                    {
                        'name': 'X-SFDC-LK',
                        'value': '00D4600000115Jo'
                    },
                    {
                        'name': 'X-SFDC-User',
                        'value': '0054p000002rbjI'
                    },
                    {
                        'name': 'X-Sender',
                        'value': 'postmaster@salesforce.com'
                    },
                    {
                        'name': 'X-mail_abuse_inquiries',
                        'value': 'http://www.salesforce.com/company/abuse.jsp'
                    },
                    {
                        'name': 'X-SFDC-Binding',
                        'value': '1WrIRBV94myi25uB'
                    },
                    {
                        'name': 'X-SFDC-EmailCategory',
                        'value': 'apiSingleMail'
                    },
                    {
                        'name': 'X-SFDC-EntityId',
                        'value': 'a024p00000AfhAS'
                    },
                    {
                        'name': 'X-SFDC-Interface',
                        'value': 'internal'
                    }
                ],
                'commonHeaders': {
                    'returnPath': 'sari@govyrl.com',
                    'from': [
                        'VYRL Watch <sari@govyrl.com>'
                    ],
                    'date': 'Thu, 19 Mar 2020 15:24:21 +0000 (GMT)',
                    'to': [
                        "\"bellagio.yelp@dwell.io\" <bellagio.yelp@dwell.io>"
                    ],
                    'messageId': '<ag-hz000000000000000000000000000000000000000000000Q7G5GL00EJfHjduZRPCGrlgFmwTYiA@sfdc.net>',
                    'subject': 'New Email Lead For The Halsten @ Chauncey Lane'
                }
            },
            'receipt': {
                'timestamp': '2020-03-19T15:24:21.482Z',
                'processingTimeMillis': 305,
                'recipients': [
                    'bellagio.yelp@dwell.io'
                ],
                'spamVerdict': {
                    'status': 'DISABLED'
                },
                'virusVerdict': {
                    'status': 'DISABLED'
                },
                'spfVerdict': {
                    'status': 'PASS'
                },
                'dkimVerdict': {
                    'status': 'PASS'
                },
                'dmarcVerdict': {
                    'status': 'GRAY'
                },
                'action': {
                    'type': 'SNS',
                    'topicArn': 'arn:aws:sns:us-east-1:186092620714:Dwell-Email-Receiving',
                    'encoding': 'UTF8'
                }
            },
            'content': "Return-Path: <sari@govyrl.com>\r\nReceived: from smtp07-ia2-sp4.mta.salesforce.com (smtp07-ia2-sp4.mta.salesforce.com [13.110.14.214])\r\n by inbound-smtp.us-east-1.amazonaws.com with SMTP id 5t9lv1dumdanru3rusm47prnaurfl1h81ogr7381\r\n for bellagio.yelp@dwell.io;\r\n Thu, 19 Mar 2020 15:24:21 +0000 (UTC)\r\nReceived-SPF: pass (spfCheck: domain of govyrl.com designates 13.110.14.214 as permitted sender) client-ip=13.110.14.214; envelope-from=sari@govyrl.com; helo=smtp07-ia2-sp4.mta.salesforce.com;\r\nAuthentication-Results: amazonses.com;\r\n spf=pass (spfCheck: domain of govyrl.com designates 13.110.14.214 as permitted sender) client-ip=13.110.14.214; envelope-from=sari@govyrl.com; helo=smtp07-ia2-sp4.mta.salesforce.com;\r\n dkim=pass header.i=@govyrl.com;\r\n dmarc=none header.from=govyrl.com;\r\nX-SES-RECEIPT: AEFBQUFBQUFBQUFHVkxONSt0VGFXd0pyODJOZzZ3ZmI5bW1UUG5zVDBSTHErNUc1NWZ6aUh3dmlIMlBLN2FIUFF5WFMyWDg4cW1qeGhzemZWcFdmOStqcmpTdFNKcGxVZ2pSRHEyK3IyS0hxSjFLWUw2dDZhMlBYOG1zRllPVGdpK3AxQ29OTTdFMkJubnU4N2dWc2J4czdsZFhmZ0oyeGtpN2RZOFRCODBaMDl2RVI0ako5NDl5dzFKLzJpMmN3VmdhR2pncTdsVU0rbC9CcW1tc3draytiV1F6a2JqZnZJRHFnZ21KVzJHSUE0eWs4bnpSMGFhUCtoREFxYUZrQmZsUHhiQVg3NkdCeGtNemVIamJ2Z2lFOXZDK29mSmpvQ01hK0QwVFJtQ1ZMN0tlSkVTMjFOY0E9PQ==\r\nX-SES-DKIM-SIGNATURE: a=rsa-sha256; q=dns/txt; b=koZawE6QkQhZjDgwtMrjfgEWU196FIGUkk6gFuwlZKcgPI50V7/z5nA8BTBdYcBICQyhpcaTAq3Eeucob5Wl4DGHamo+k9tHiDFvy1h3datSZwyIiIIRmmzw7vYs3KwebXM4R/4BxSNRED28c47NOJwwUL5Fb9HCc96Htb+aTAY=; c=relaxed/simple; s=224i4yxa5dv7c2xz3womw6peuasteono; d=amazonses.com; t=1584631461; v=1; bh=+jOGqVN31Fhp5yMcawNvjY7SCUds2pCGfyZZNh7b6B4=; h=From:To:Cc:Bcc:Subject:Date:Message-ID:MIME-Version:Content-Type:X-SES-RECEIPT;\r\nReturn-Path: <sari@govyrl.com>\r\nDKIM-Signature: v=1; a=rsa-sha256; c=relaxed/simple; d=govyrl.com;\r\n\ts=office3652; t=1584631461;\r\n\tbh=+jOGqVN31Fhp5yMcawNvjY7SCUds2pCGfyZZNh7b6B4=;\r\n\th=Date:From:To:Subject:MIME-Version:Content-Type;\r\n\tb=fio78HyDSOV9aqgYXTI3B00NoH/XMbuLE56eQlSb7a3PZ/nTMt26+32WLDjMkogwG\r\n\t QLpBL1N93a8g0K/WRx6wOc+h8b+kKKHBZWS/JDzdJPjxJqDV9MPzxfLLNEVvZSnEKg\r\n\t hGZm8vwQsOBjXyKIXWvnsX4bUPzAX0bcofzpEMaoihALD6CetETnfeRMVQXp+iHpvX\r\n\t RcS+ktJ95Avg8/BfLlXkpQJE9BHz7t5LzRwODmpC0NPsMS/pDyZq96m9N/h+rdCJKv\r\n\t I2+8PeD5KocQ4yWAlUGJX9rgtFrUJjufI1QEh9sHHJcnJx8kIxmJmcyrRK14wNYOYd\r\n\t LA/4PtW0iTYbg==\r\nAuthentication-Results:  mx1-ia2-sp4.mta.salesforce.com x-tls.subject=\"/C=US/ST=California/L=San Francisco/O=salesforce.com, inc./OU=0:app;1:ia2;2:ia2-sp4;3:na142;4:prod/CN=na142-app1-4-ia2.ops.sfdc.net\"; auth=pass (cipher=ECDHE-RSA-AES256-GCM-SHA384)\r\nReceived: from [10.176.14.22] ([10.176.14.22:36814] helo=na142-app1-4-ia2.ops.sfdc.net)\r\n\tby mx1-ia2-sp4.mta.salesforce.com (envelope-from <sari@govyrl.com>)\r\n\t(ecelerity 4.2.38.62368 r(Core:release/4.2.38.0)) with ESMTPS (cipher=ECDHE-RSA-AES256-GCM-SHA384\r\n\tsubject=\"/C=US/ST=California/L=San Francisco/O=salesforce.com, inc./OU=0:app;1:ia2;2:ia2-sp4;3:na142;4:prod/CN=na142-app1-4-ia2.ops.sfdc.net\") \r\n\tid 5E/F0-44432-5AE837E5; Thu, 19 Mar 2020 15:24:21 +0000\r\nDate: Thu, 19 Mar 2020 15:24:21 +0000 (GMT)\r\nFrom: VYRL Watch <sari@govyrl.com>\r\nTo: \"bellagio.yelp@dwell.io\" <bellagio.yelp@dwell.io>\r\nMessage-ID: <ag-hz000000000000000000000000000000000000000000000Q7G5GL00EJfHjduZRPCGrlgFmwTYiA@sfdc.net>\r\nSubject: New Email Lead For The Halsten @ Chauncey Lane\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; \r\n\tboundary=\"----=_Part_3681_1435345900.1584631461335\"\r\nX-Priority: 3\r\nX-SFDC-LK: 00D4600000115Jo\r\nX-SFDC-User: 0054p000002rbjI\r\nX-Sender: postmaster@salesforce.com\r\nX-mail_abuse_inquiries: http://www.salesforce.com/company/abuse.jsp\r\nX-SFDC-Binding: 1WrIRBV94myi25uB\r\nX-SFDC-EmailCategory: apiSingleMail\r\nX-SFDC-EntityId: a024p00000AfhAS\r\nX-SFDC-Interface: internal\r\n\r\n------=_Part_3681_1435345900.1584631461335\r\nContent-Type: multipart/alternative; \r\n\tboundary=\"----=_Part_3680_1087891096.1584631461335\"\r\n\r\n------=_Part_3680_1087891096.1584631461335\r\nContent-Type: text/plain; charset=ISO-8859-1\r\nContent-Transfer-Encoding: 7bit\r\n\r\nFirst Name: Jess\r\nLast Name: D.\r\nHome Phone: 4532838383\r\nCell Phone:\r\nWork Phone:\r\nEmail Address: jess.d@gmail.com\r\nLead Channel: Yelp.com\r\nDesired Move In:\r\nDesired Lease Term:\r\nDesired Unit Type:\r\nDesired Bedrooms:\r\nDesired Bathrooms:\r\nMessage from renter: \"Describe your need: test comment \r\nLooking for move in today unit. 1 bdrm or 2 bdrm\"\r\nBudget:\r\nPets:\r\nAmenities:\r\nQualifications:\r\n------=_Part_3680_1087891096.1584631461335\r\nContent-Type: text/html; charset=ISO-8859-1\r\nContent-Transfer-Encoding: 7bit\r\n\r\n<html>First Name: Jess\r\nLast Name: D.\r\nHome Phone:\r\nCell Phone:\r\nWork Phone:\r\nEmail Address: \r\nLead Channel: Yelp.com\r\nDesired Move In:\r\nDesired Lease Term:\r\nDesired Unit Type:\r\nDesired Bedrooms:\r\nDesired Bathrooms:\r\nMessage from renter: \"Describe your need:\r\nLooking for move in today unit. 1 bdrm or 2 bdrm\"\r\nBudget:\r\nPets:\r\nAmenities:\r\nQualifications:<img src=\"http://vyrlmarketing.my.salesforce.com/servlet/servlet.ImageServer?oid=00D4600000115Jo&esid=0184p000004Z2vi\"></html>\r\n------=_Part_3680_1087891096.1584631461335--\r\n\r\n------=_Part_3681_1435345900.1584631461335--\r\n"
        }

        endpoint = reverse('email_messages-receive-ils-emails')
        response = self.client.post(endpoint, dict(Message=json.dumps(G5_email_body)), format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(endpoint, dict(Message=json.dumps(AL_email_body)), format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(endpoint, dict(Message=json.dumps(Yelp_email_body)), format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(ILSEmail.objects.filter(lead=None).count(), 3)
        convert_ils_emails_to_leads()

        lead = Lead.objects.filter(first_name='Melissa', last_name='Kling').first()
        self.assertEqual(lead.email, 'mkmissy01@gmail.com')
        self.assertEqual(lead.phone_number, '(480) 465-2870')
        self.assertIn('Test comment', lead.notes.first().text)
        self.assertNotIn('If you would like to unsubscribe and stop receiving these emails click here',
                         lead.notes.first().text)


        lead = Lead.objects.filter(first_name='Eshekiah', last_name='Herron').first()
        self.assertEqual(lead.email, 'soready2bme@gmail.com')
        self.assertEqual(lead.phone_number, '(414) 491-9567')
        self.assertIn('In unit laundry, Parking, Hardwood floors, Dishwasher, Air conditioning',
                      lead.notes.first().text)
        self.assertIn('No prior evictions, meets your income requirement', lead.notes.first().text)
        self.assertIn(
            'New Lead from Eshekiah   |   MOVE-IN: 05/22/2020 (59 days away!)   |   BEDS: 3   |   BUDGET: $1,500   |   PETS: Did not specify.',
            lead.notes.first().text)

        lead = Lead.objects.filter(first_name='Jess', last_name='D.').first()
        self.assertEqual(lead.email, 'jess.d@gmail.com')
        self.assertEqual(lead.phone_number, '(453) 283-8383')
        self.assertIn('Describe your need: test comment', lead.notes.first().text)

        self.assertEqual(ILSEmail.objects.filter(lead=None).count(), 0)
