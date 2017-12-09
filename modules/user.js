"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force");
    
var SLACK_LOGIN_TOKEN =  process.env.SF_LOGIN_URL,      
    mappings = {};


exports.userObject = (req, res) => {

    if (req.body.token != SLACK_LOGIN_TOKEN) {
        res.send("Invalid token");
        return;
    }
    var actionJSONPayload = JSON.parse(req.body.payload)
    let slackUserName = actionJSONPayload.user.name,
    oauthObj = auth.getOAuthObject(slackUserId),
    slackUserId = actionJSONPayload.user.id,
    soql = "Select id from User where Slack_Name__c = '@"+slackUserName+"'",
    oauthObj = auth.getOAuthObject(slackUserId);

    force.query(oauthObj, soql)
    .then(data => { 
        let users = JSON.parse(data).records;
        if (users && users.length>0)
        {
            let userId = users[0].Id;
            console.log('useridfunction'+userId);
            let userId = users[0].Id;
            mappings[userId] = UserId;
            return userId;
        }
    })
    .catch((error) => {
        if (error.code == 401) {
            res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId);

        } else {
            res.send("An error as occurred" +error.message);
        }
    });
    
}
exports.getUserObject = UserId => mappings[UserId];