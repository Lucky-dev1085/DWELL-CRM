import logging
import backoff
import requests
from xml.etree.ElementTree import fromstring, Element, SubElement
from xml.etree.ElementTree import tostring
from django.conf import settings


@backoff.on_predicate(backoff.fibo, lambda response: response.status_code != 200,
                      max_tries=settings.MAX_PMS_SYNC_RETRIES + 1)
def get_response(url, body, headers):
    return requests.post(url, data=body, headers=headers)


def invoke_real_page_api(api_name, property, additional_content=None):
    envelope = Element('soapenv:Envelope')
    envelope.set('xmlns:soapenv', 'http://schemas.xmlsoap.org/soap/envelope/')
    envelope.set('xmlns:tem', 'http://tempuri.org/')

    SubElement(envelope, 'soapenv:Header')
    method_container = SubElement(SubElement(envelope, 'soapenv:Body'), f'tem:{api_name}')
    auth = SubElement(method_container, 'tem:auth')

    SubElement(auth, 'tem:pmcid').text = property.real_page_pmc_id
    SubElement(auth, 'tem:siteid').text = property.real_page_site_id
    SubElement(auth, 'tem:username').text = getattr(settings, 'REAL_PAGE_API_USERNAME', None)
    SubElement(auth, 'tem:password').text = getattr(settings, 'REAL_PAGE_API_PASSWORD', None)
    SubElement(auth, 'tem:licensekey').text = getattr(settings, 'REAL_PAGE_API_LICENSE_KEY', None)
    SubElement(auth, 'tem:system').text = 'OneSite'

    if type(additional_content) == Element:
        method_container.insert(1, additional_content)

    headers = {'Content-Type': 'text/xml;',
               'SOAPAction': f'http://tempuri.org/IRPXService/{api_name}'}

    response = get_response(
        'https://gateway.rpx.realpage.com/RPXGateway/partner/LiftLytics/LiftLytics.svc',
        tostring(envelope),
        headers
    )
    if response.status_code != 200:
        logging.error(f'Real Page API call for {api_name} was failed on the <{property.name}>.')
        return None

    return fromstring(response.content)
