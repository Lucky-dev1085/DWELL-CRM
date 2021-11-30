window.addEventListener("load", () => {
    if (!$) {
        window.$ = django.jQuery;
    }

    const operation = window.location.pathname.split('/').slice(-2)[0]

    const propertySelector =  $('select[name="property"]')
    const dateInput = $('#id_call_date')

    if (operation === 'add') {
        $('label[for="id_call"]').text('Caller:');
        $('.field-call').hide();
        $('.field-call_scorer').hide();
    }

    propertySelector.on('change', function () {
        if (operation === 'add') {
            if (!$(this).val()) {
                $('.field-call').hide();
                $('.field-call_scorer').hide();
            } else {
                if (dateInput.val()) {
                    getFieldData('/api/v1/scored_calls/callers/', 'call', $(this).val(), dateInput.val())
                    getFieldData('/api/v1/scored_calls/call_scorers/', 'call_scorer', $(this).val(), dateInput.val())
                    $('.field-call').show();
                    $('.field-call_scorer').show();
                }
            }
        }
    });

    dateInput.on('change focus', function () {
        if (operation === 'add') {
            if (!$(this).val()) {
                $('.field-call').hide();
                $('.field-call_scorer').hide();
            } else {
                if (propertySelector.val()) {
                    getFieldData('/api/v1/scored_calls/callers/', 'call', propertySelector.val(), $(this).val())
                    getFieldData('/api/v1/scored_calls/call_scorers/', 'call_scorer', propertySelector.val(), $(this).val())
                }

            }
        }
    });
});

function getFieldData(url, field, property, date) {
    $.getJSON(url, {property: parseInt(property), date: date}, function (jsonResponse) {
        const data = JSON.parse(jsonResponse);
        let options = '<option value="">--------&nbsp;</option>';
        for (let i = 0; i < data.length; i++) {
            const label = field === 'call' ? data[i].fields.prospect_phone_number : data[i].fields.email
            options += '<option value="' + data[i].pk + '">' + label + '</option>';
        }
        $(`select[name="${field}"]`).html(options);
        $(`select[name="${field}"] option:first`).attr('selected', 'selected');
        $(`.field-${field}`).show();
    })
}