(function(params) {
    var clariveTopicComboBox = Cla.ui.form.categoryBox({
        name: 'clariveTopic',
        fieldLabel: _('Clarive Topic Name'),
        value: params.rec.clariveTopic || '',
        allowBlank: false,
        singleMode: true,
        anchor: '50%'
    });

    var viewNameText = Cla.ui.textField({
        name: 'viewName',
        fieldLabel: 'Remedyforce View Internal Name',
        allowBlank: false,
        anchor: '50%'
    });

    var fieldMap = Cla.ui.dataEditor({
        name: 'fieldMap',
        title: _('Clarive - Remedyforce Field Correspondence'),
        hide_save: true,
        hide_cancel: true,
        hide_type: true,
        height: 300,
        data: params.rec.fieldMap || {
            'description': 'BMCServiceDesk__incidentDescription__c',
            'open_date': 'BMCServiceDesk__openDateTime__c',
            'due_date': 'BMCServiceDesk__dueDateTime__c'
        }
    });

    var listMap = Cla.ui.dataEditor({
        name: 'listMap',
        title: _('Clarive - Remedyforce List Correspondence'),
        hide_save: true,
        hide_cancel: true,
        height: 400,
        data: params.rec.listMap || {

            "impact": {
                "High": "a2M0Y000000aiHYUAY",
                "Low": "a2M0Y000000aiHaUAI",
                "Medium": "a2M0Y000000aiHZUAY"
            },
            "priority_level": {
                "Critical": "a2h0Y000000b4bqQAA",
                "High": "a2h0Y000000b4brQAA",
                "Low": "a2h0Y000000b4bwQAA",
                "Medium": "a2h0Y000000b4btQAA",
                "Very Low": "a2h0Y000000b4byQAA"
            },
            "status_new": {
                "2": "a3w0Y0000004fkgQAA",
                "14": "a3w0Y0000004fkhQAA",
                "22": "a3w0Y0000004flBQAQ",
                "1293": "a3w0Y0000004flEQAQ"
            },
            "urgency": {
                "High": "a470Y000000HqEBQA0",
                "Low": "a470Y000000HqEDQA0",
                "Medium": "a470Y000000HqECQA0"
            }

        },
        hide_type: false
    });

    return [
        viewNameText,
        clariveTopicComboBox,
        fieldMap,
        listMap
    ]
})