var reg = require("cla/reg");

reg.register('service.remedyforce_outbound', {
    name: 'Remedyforce Outbound',
    icon: '/plugin/cla-remedyforce-plugin/icon/remedyforce-service.svg',
    form: '/plugin/cla-remedyforce-plugin/form/remedyforce-services-call.js',
    handler: function(ctx, config) {

        var ci = require("cla/ci");
        var log = require("cla/log");
        var web = require("cla/web");
        var cla = require("cla/cla");
        var db = require("cla/db");
        var sem = require("cla/sem");
        var myUtils = require("myutils");

        log.info(_("Remedyforce Outbound service started"));

        var server = config.server || '';
        var remedyServer = ci.findOne({
            mid: server + ''
        });

        var synchronizeWhen = config.synchronizeWhen || '';

        if (synchronizeWhen == '') {
            log.error(_("synchronizeWhen option undefined."));
            return;
        }

        if (!remedyServer) {
            log.error(_("Remedyforce Server undefined. Please choose one. "));
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
        var topicData = ctx.stash('topic_data');

        var headers = {
            'authorization': 'Bearer ' + accessToken,
            'content-type': 'application/json'
        };
        var mid = ctx.stash('topic_mid');
        var agentBuild = web.agent({
            auto_parse: 0
        });
        switch (synchronizeWhen) {
            case 'Update':
            case 'Create':
                var ret = sem.take('SemRemedy', function() {
                    if (mid && synchronizeWhen == 'Update') {
                        var topic = myUtils.controlflag(mid);
                        var remedyforceId = topic['_remedyforce_number'];
                        if (!topic || topic['_remedyforce_upd'] != '0' || !remedyforceId) {
                            return;
                        }
                    }
                    if (ctx.stash('_remedyforce_number')) {
                        return;
                    }

                    var topicIdCat = topicData.id_category;
                    var topicMid = topicData.mid;
                    var content = {};
                    var requestedView = ci.findOne('RemedyforceView', {
                        clariveTopic: topicIdCat
                    });

                    if (!requestedView) {
                        log.error(_("This category has not an associated Remedyforce view"));
                        return;
                    }

                    var viewName = requestedView.viewName;

                    var detailsUrl = instanceUrl + restEndPoint + viewName + '/describe';
                    var responseDetails = agentBuild.get(detailsUrl, {
                        headers: headers
                    });
                    var sobjectDetailsFields = JSON.parse(responseDetails.content).fields;
                    for (var clariveField in requestedView.fieldMap) {
                        var remedyField = requestedView.fieldMap[clariveField];
                        content = myUtils.buildContentRemedy(ctx, sobjectDetailsFields, remedyField, topicData, clariveField, requestedView, content);
                    }
                    if (synchronizeWhen == 'Create') {
                        var topicUrl = instanceUrl + restEndPoint + viewName;
                        content = JSON.stringify(content);
                        response = agentBuild.post(topicUrl, {
                            content: content,
                            headers: headers
                        });
                        var responseContent = JSON.parse(response.content);
                        var coll = db.getCollection('topic');
                        var topics = coll.update({
                            mid: topicMid
                        }, {
                            $set: {
                                _remedyforce_number: responseContent.id,
                                _remedyforce_upd: '0'
                            }
                        });
                    } else {
                        var topicUrl = instanceUrl + restEndPoint + viewName + '/' + remedyforceId;
                        content = JSON.stringify(content);
                        try {
                            response = agentBuild.request('PATCH', topicUrl, {
                                content: content,
                                headers: headers
                            });
                        } catch (e) {
                            log.error(e.message);
                        }
                    }
                });
                break;

            case 'Delete':
                var topics = db.getCollection('topic');
                var topic = topics.findOne({
                    mid: mid
                });
                var remedyNumber = topic['_remedyforce_number'];
                if (!topic || !remedyNumber) {
                    return;
                }
                var categoryId = topic['category_id'];

                var requestedView = ci.findOne('RemedyforceView', {
                    clariveTopic: categoryId
                });

                var remedyCategory = requestedView.viewName + '/';
                var topicUrl = instanceUrl + restEndPoint + remedyCategory + remedyNumber;

                try {
                    var response = agentBuild.delete(topicUrl, {
                        headers: headers
                    });
                } catch (e) {
                    log.error(e);
                }
                log.info(_('Deleted Topic with mid ') + mid);
                break;

            case 'Change Status':
                var ret = sem.take('SemRemedy', function() {
                    var topicIdCat = ctx.stash('category_id');
                    var content = {};
                    var requestedView = ci.findOne('RemedyforceView', {
                        clariveTopic: topicIdCat
                    });
                    var viewName = requestedView.viewName;

                    if (!viewName) {
                        return;
                    }

                    var coll = db.getCollection('topic');
                    var topic = coll.findOne({
                        mid: mid
                    });
                    var remedyforceId = topic['_remedyforce_number'];
                    if (topic['_remedyforce_upd'] != '0' || !remedyforceId) {
                        return;
                    }
                    var topics = coll.update({
                        mid: mid
                    }, {
                        $set: {
                            _remedyforce_upd: '1'
                        }
                    });

                    if (requestedView.fieldMap['status_new']) {
                        var remedyField = requestedView.fieldMap['status_new'];
                        if (requestedView.listMap['status_new']) {
                            content[remedyField] = requestedView.listMap['status_new'][ctx.stash('id_status')];
                        }
                    } else {
                        return;
                    }
                    var topicUrl = instanceUrl + restEndPoint + viewName + '/' + remedyforceId;
                    content = JSON.stringify(content);
                    try {
                        response = agentBuild.request('PATCH', topicUrl, {
                            content: content,
                            headers: headers
                        });
                    } catch (e) {
                        log.error(e.message);
                    }
                });
                break;

            default:
                log.fatal(_("Error in synchronizeWhen option."));
        }

        log.info(_("Remedyforce Outbound service finished"));
    }
});