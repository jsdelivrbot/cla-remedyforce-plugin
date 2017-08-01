(function(params) {

    return [
        new Cla.ui.ciCombo({
            name: 'server',
            value: params.data.server || '',
            class: 'RemedyforceServer',
            fieldLabel: 'Remedyforce Server',
            allowBlank: false,
            anchor: '50%',
            with_vars: 1
        }),
        new Cla.ui.comboBox({
            name: 'synchronizeWhen',
            fieldLabel: 'Action',
            data: [
                ['Create', 'Create'],
                ['Update', 'Update'],
                ['Delete', 'Delete'],
                ['Change Status', 'Change Status']
            ],
            value: params.data.synchronizeWhen || '',
            disabled: false,
            hidden: false,
            allowBlank: false,
            anchor: '50%',
            singleMode: true
        })

    ]
})