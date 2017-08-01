exports.login = function(agent, urlLoginServer, clientId, clientSecret, userName, password, securityToken) {

    var loginUrl = urlLoginServer + '/token?grant_type=password&client_id=';
    var authUrl = loginUrl +
        clientId +
        '&client_secret=' + clientSecret +
        '&username=' + userName +
        '&password=' + password +
        securityToken;
    var response = agent.post(authUrl);
    return response;
};

exports.buildContentRemedy = function(ctx,sobjectDetailsFields, remedyField, topicData, clariveField, requestedView, content) {
    for (var i = 0; i < sobjectDetailsFields.length; i++) {
        if (sobjectDetailsFields[i].name == remedyField && topicData[clariveField]) {
            switch (sobjectDetailsFields[i].type) {
                case 'reference':
                    if (requestedView.listMap[clariveField]) {
                        if (clariveField == 'status_new') {
                            content[remedyField] = requestedView.listMap['status_new'][ctx.stash('status_new')];
                        }
                        else {
                        for (var clariveColumn in requestedView.listMap[clariveField]) {
                            var remedyColumn = requestedView.listMap[clariveField][clariveColumn];
                            if (clariveColumn == topicData[clariveField]) {
                                content[remedyField] = remedyColumn;
                                break;
                            }
                        }
                    }
                    } else {
                        content[remedyField] = topicData[clariveField];
                    }
                    break;
                case 'datetime':
                    content[remedyField] = controlDate(topicData[clariveField]);
                    break;
                case 'boolean':
                    if (topicData[clariveField] == 0) {
                        content[remedyField] = 'false';
                    } else {
                        content[remedyField] = 'true';
                    }
                    break;
                default:
                    content[remedyField] = topicData[clariveField];
                    break;
            }
        }
    }
    return content;
};

exports.buildContentClarive = function(sobjectDetailsFields, remedyField, stashRemedyNew, clariveField, requestedView, variablesContent) {
    for (var i = 0; i < sobjectDetailsFields.length; i++) {
        if (sobjectDetailsFields[i].name == remedyField && stashRemedyNew[remedyField]) {
            switch (sobjectDetailsFields[i]['type']) {

                case 'reference':
                    if (requestedView.listMap[clariveField]) {
                        for (var clariveColumn in requestedView.listMap[clariveField]) {
                            var remedyColumn = requestedView.listMap[clariveField][clariveColumn];
                            if (remedyColumn == stashRemedyNew[remedyField]) {
                                variablesContent[clariveField] = clariveColumn;
                                break;
                            }
                        }
                    } else {
                        variablesContent[clariveField] = stashRemedyNew[remedyField];
                    }
                    break;

                case 'datetime':
                    variablesContent[clariveField] = controlDate(stashRemedyNew[remedyField]);
                    break;

                case 'boolean':
                    variablesContent[clariveField] = (wsBodyNew[remedyField]) ? '1' : '0';
                    break;

                default:
                    variablesContent[clariveField] = stashRemedyNew[remedyField];
                    break;
            }
        }
    }
    return variablesContent;
};

exports.controlflag = function(mid) {
    var db = require("cla/db");

    var topics = db.getCollection('topic');
    var topic = topics.findOne({
        mid: mid
    });
    topics.update({
        mid: mid
    }, {
        $set: {
            _remedyforce_upd: (topic['_remedyforce_upd'] == '0') ? '1' : '0'
        }
    });
    return topic;
};

exports.getDataFields = function(instanceUrl, restEndPoint, serviceType, headers) {
    var log = require('cla/log');
    var web = require("cla/web");

    var detailsUrl = instanceUrl + restEndPoint + serviceType + '/describe';
    var agentNotParsed = web.agent({
        auto_parse: 0
    });
    try {
        var responseDetails = agentNotParsed.get(detailsUrl, {
            headers: headers
        });
    } catch (e) {
        log.error(_("Error to get the fields of the remedy category remotely"));
    }
    var sobjectDetailsFields = JSON.parse(responseDetails.content).fields;
    return sobjectDetailsFields;
};

function controlDate(date) {
    if (date.includes(' ')) {
        return date.replace(' ', 'T');
    } else {
        return date.replace('T', ' ');
    }
};