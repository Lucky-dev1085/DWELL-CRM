import logging
import pytz
import re
from datetime import datetime
from word2number import w2n

TZ = pytz.timezone('America/Phoenix')


def parse_unit_type(unit_type, key_to_get='beds'):
    if not unit_type:
        return None
    splits = unit_type.split('x')

    try:
        if key_to_get == 'beds':
            value = int(splits[0])
        else:
            value = int(splits[1])
    except (IndexError, ValueError):
        return None

    return value


def parse_various_format_date(text, today):
    if not text:
        return None
    text = re.sub(r'(\d)(st|nd|rd|th)', r'\1', text)

    if 'available' in text.lower() or 'now' in text.lower() or 'today' in text.lower():
        return today
    for fmt in ('%m/%d/%Y', '%B %d, %Y', '%b %d', '%b %d, %Y', '%m/%d', '%m/%d/%y', '%b. %d'):
        try:
            date = datetime.strptime(text, fmt)
            if date.year < 2000:
                date = date.replace(year=today.year)
            return date.date()
        except ValueError:
            pass

    if 'Inquire for details' not in text:
        logging.error(f'no valid date format found from: {text}')
    return None


def parse_concession(specials, average_rent):
    if not specials:
        return None
    if specials and type(specials) == str:
        regex = '([A-Z|a-z|\d]+)\s(weeks free|week free|month free|months free)'
        matching = next((i for i in re.findall(regex, specials.lower())), None)
        try:
            if matching:
                if not average_rent:
                    return None
                number = w2n.word_to_num(matching[0])
                if 'week' in matching[1].lower():
                    return average_rent * number / 4
                else:
                    return average_rent * number
            else:
                matching = re.findall(r'(?:[\£\$\€]{1}[,\d]+.?\d*)', specials)
                if matching and len(matching):
                    specials = re.sub(r'[^\d.]', '', matching[0])
                    specials = specials[:-1] if specials.endswith('.') else specials

                    return float(specials)
        except ValueError:
            pass

    return None


def parse_float(value):
    import math
    if not value:
        return 0
    frac, whole = math.modf(value)
    if frac == 0.0:
        return int(value)
    return value
