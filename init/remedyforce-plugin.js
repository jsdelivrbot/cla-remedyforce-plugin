var ci = require("cla/ci");

ci.createRole("Remedyforce");

ci.createClass("RemedyforceServer", {
    form: '/plugin/cla-remedyforce-plugin/form/remedyforce-server.js',
    icon: '/plugin/cla-remedyforce-plugin/icon/remedyforce-ci-server.svg',
    roles: ["Remedyforce"],
    has: {
        userName: {
            is: "rw",
            isa: "Str",
            required: true
        },
        password: {
            is: "rw",
            isa: "Str",
            required: true
        },
        clientSecret: {
            is: "rw",
            isa: "Str",
            required: true
        },
        clientId: {
            is: "rw",
            isa: "Str",
            required: true
        },
        securityToken: {
            is: "rw",
            isa: "Str",
            required: true
        },
        loginUrl: {
            is: "rw",
            isa: "Str",
            required: true
        }
    }

});

ci.createClass("RemedyforceView", {
    form: '/plugin/cla-remedyforce-plugin/form/remedyforce-view.js',
    icon: '/plugin/cla-remedyforce-plugin/icon/remedyforce-ci-view.svg',
    roles: ["Remedyforce"],
    has: {
        clariveTopic: {
            is: "rw",
            isa: "Str",
            required: true
        },
        viewName: {
            is: "rw",
            isa: "Str",
            required: true
        },
        fieldMap: {
            is: "rw",
            isa: "HashRef",
            required: false
        },
        listMap: {
            is: "rw",
            isa: "HashRef",
            required: false
        }
    }
});