var reg = require("cla/reg");

reg.register('service.remedyforce_inbound', {
    name: 'Remedyforce Inbound',
    icon: '/plugin/cla-remedyforce-plugin/icon/remedyforce-service.svg',
    form: '/plugin/cla-remedyforce-plugin/form/remedyforce-services-call.js',
    rulebook: {
        moniker: 'remedyforce_inbound',
        description: _('Remedyforce inbound service'),
        required: ['server', 'synchronize_when'],
        allow: [ 'server', 'synchronize_when'],
        mapper: {
            'synchronize_when':'synchronizeWhen'
        },
        examples: [{
            remedyforce_inbound: {
                server: 'remedyforce_resource',
                synchronize_when: 'create'
            }
        }]
    },
    handler: function(ctx, config) {

        var ci = require("cla/ci");
        var reg = require('cla/reg');
        var log = require('cla/log');
        var db = require("cla/db");
        var sem = require("cla/sem");
        var web = require("cla/web");
        var myUtils = require("myutils");

        log.info(_("Remedyforce Inbound service started"));

        var server = config.server || '';
        var synchronizeWhen = config.synchronizeWhen || '';

        var remedyServer = ci.findOne({
            mid: server + ''
        });
        if (!remedyServer) {
            log.error(_("Remedyforce Server undefined. Please choose one."));
            return;
        }
        var urlLoginServer = remedyServer.loginUrl;

        if (!urlLoginServer) {
            log.error(_("Missing loginUrl parameter."));
            return;
        }

        var clientId = remedyServer.clientId;
        var clientSecret = remedyServer.clientSecret;
        var userName = remedyServer.userName;
        var password = remedyServer.password;
        var securityToken = remedyServer.securityToken;

        var agent = web.agent();

        try {
            var response = myUtils.login(agent, urlLoginServer, clientId, clientSecret, userName, password, securityToken);
        } catch (e) {
            log.fatal(_("Login URL malformed"));
        }
        var accessToken = response.content.access_token;
        var instanceUrl = response.content.instance_url;
        var restEndPoint = "/services/data/v39.0/sobjects/";
        var headers = {
            'authorization': 'Bearer ' + accessToken,
            'content-type': 'application/json'
        };

        var stashRemedy = ctx.stash('ws_params');

        var variablesContent = {};
        if (synchronizeWhen != 'Delete') {
            var wsBody = JSON.parse(ctx.stash('ws_body'));
            var wsBodyNew = wsBody['new'][0];
            var stashRemedyNew = stashRemedy['new'][0];
            var viewType = stashRemedyNew['attributes'];
            var serviceType = viewType['type'];
            var requestedView = ci.findOne('RemedyforceView', {
                viewName: serviceType
            });

            if (!requestedView) {
                log.error(_("This category has not an associated Remedyforce view"));
                return;
            }
            var clariveCategory = "";
            clariveCategory = requestedView.clariveTopic;

            if (clariveCategory == "") {
                log.warn(_("Clarive category not declared"));
                return;
            }
        }

        switch (synchronizeWhen) {
            case 'Create':
                var sobjectDetailsFields = myUtils.getDataFields(instanceUrl, restEndPoint, serviceType, headers);
                var remedyIdExists = false;
                var ret = sem.take('SemRemedy', function() {
                    var coll = db.getCollection('topic');
                    var topic = coll.findOne({
                        _remedyforce_number: stashRemedyNew['Id']
                    });
                    if (topic) {
                        return;
                    }

                    for (var clariveField in requestedView.fieldMap) {
                        var remedyField = requestedView.fieldMap[clariveField];
                        variablesContent = myUtils.buildContentClarive(sobjectDetailsFields, remedyField, stashRemedyNew, clariveField, requestedView, variablesContent);

                    }
                    variablesContent['_remedyforce_number'] = stashRemedyNew['Id'];
                    variablesContent['_remedyforce_upd'] = '0';

                    reg.launch('service.topic.create', {
                        name: 'Service topic create',
                        config: {
                            title: stashRemedyNew['Name'],
                            category: clariveCategory,
                            status: variablesContent['status_new'],
                            username: stashRemedy['username'],
                            variables: variablesContent
                        }
                    });
                });
                break;

            case 'Update':
                var sobjectDetailsFields = myUtils.getDataFields(instanceUrl, restEndPoint, serviceType, headers);
                var ret = sem.take('SemRemedy', function() {
                    var coll = db.getCollection('topic');
                    var topic = coll.findOne({
                        '_remedyforce_number': stashRemedyNew['Id']
                    });
                    if (!topic) {
                        log.error("Topic with Remedyforce Id " + stashRemedyNew['Id'] + " does not exist");
                        return;
                    }
                    var mid = topic.mid;
                    if (mid) {
                        topic = myUtils.controlflag(mid);
                        if (topic['_remedyforce_upd'] != '0') {
                            return;
                        }
                    }
                    for (var clariveField in requestedView.fieldMap) {
                        var remedyField = requestedView.fieldMap[clariveField];
                        variablesContent = myUtils.buildContentClarive(sobjectDetailsFields, remedyField, stashRemedyNew, clariveField, requestedView, variablesContent);
                    }
                    variablesContent['title'] = stashRemedyNew['Name'];
                    if (variablesContent['status_new'] && variablesContent['status_new'] != topic['status_new']) {
                        reg.launch('service.topic.change_status', {
                            config: {
                                topics: topic['mid'],
                                new_status: variablesContent['status_new'],
                                username: stashRemedy['username']
                            }
                        });
                    }
                    reg.launch('service.topic.update', {
                        config: {
                            mid: topic['mid'],
                            username: stashRemedy['username'],
                            variables: variablesContent
                        }
                    });
                });
                break;

            case 'Delete':
                var arrayOld = stashRemedy['old'];
                var collTopics = db.getCollection('topic');

                for (var i = 0; i < arrayOld.length; i++) {
                    var topics = collTopics.find();
                    topics.forEach(function(topic) {
                        if (topic['_remedyforce_number'] == arrayOld[i]['Id']) {
                            reg.launch('service.topic.delete', {
                                config: {
                                    topics: topic['mid'],
                                    username: stashRemedy['username']
                                }
                            });
                            return;
                        }
                    });
                }
                break;
            default:
                log.fatal(_("Error in synchronizeWhen option."));
        }
        log.info(_("Remedyforce Inbound service finished"));
    }
});