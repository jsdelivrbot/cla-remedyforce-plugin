(function(params) {

    var userName = Cla.ui.textField({
        name: 'userName',
        fieldLabel: _('Username'),
        allowBlank: false
    });

    var password = Cla.ui.textField({
        name: 'password',
        fieldLabel: _('Password'),
        inputType: 'password',
        allowBlank: false
    });

    var clientId = Cla.ui.textField({
        name: 'clientId',
        fieldLabel: _('Consumer Key'),
        allowBlank: false
    });

    var securityToken = Cla.ui.textField({
        name: 'securityToken',
        fieldLabel: _('Security Token'),
        allowBlank: false
    });

    var clientSecret = Cla.ui.textField({
        name: 'clientSecret',
        fieldLabel: _('Consumer Secret'),
        allowBlank: false
    });

    var loginUrl = Cla.ui.textField({
        name: 'loginUrl',
        fieldLabel: _('Login URL'),
        allowBlank: false,
        value: 'https://login.salesforce.com/services/oauth2'
    });

    return [
        userName,
        password,
        clientId,
        securityToken,
        clientSecret,
        loginUrl
    ]
})