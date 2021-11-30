from django.forms import DateTimeInput


class CustomDateTimePickerInput(DateTimeInput):
    template_name = 'widgets/custom_datepicker.html'

    class Media:
        css = {
            'all': (
                'https://cdnjs.cloudflare.com/ajax/libs/jquery-datetimepicker/2.5.20/jquery.datetimepicker.min.css',
            )
        }
        js = (
            'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.23.0/moment.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.16/moment-timezone-with-data.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/jquery-datetimepicker/2.5.20/jquery.datetimepicker.full.min.js',
        )

