"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force"),
	CASE_TOKEN = process.env.SLACK_CASE_TOKEN;

exports.execute = (req, res) => {

    if (req.body.token != CASE_TOKEN) {
        res.send("Invalid token");
        return;
    }

    let slackUserId = req.body.user_id,
        oauthObj = auth.getOAuthObject(slackUserId),
        params = req.body.text.split(":"),
        subject = params[0],
        description = params[1];

    force.create(oauthObj, "Case",
        {
            subject: subject,
            description: description,
            origin: "Slack",
            status: "New"
        })
        .then(data => {
            let fields = [];
            fields.push({title: "Subject Slack Test2", value: subject, short:false});
            fields.push({title: "Description Case", value: description, short:false});
            fields.push({title: "Open in Salesforce:", value: oauthObj.instance_url + "/" + data.id, short:false});
            let message = {
                text: "A new case has been created:",
                attachments: [
                    {color: "#F2CF5B", fields: fields,
					"attachment_type": "default",
            
			"actions": [
                 
                {
                    "name": "change owner",
                    "text": "Claim To Be The Case Owner",
                    "style": "danger",
                    "type": "button",
                    "value": slackUserId,
                    "confirm": {
                        "title": "",
                        "text": "Are you sure?",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
                    }
                }
            ] 
			
			
					}
                ]
            };
			console.log('----slack user is ' + slackUserId);
            res.json(message);
			
			 
        })
        .catch((error) => {
            if (error.code == 401) {
                res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId);

            } else {
                res.send("An error as occurred");
            }
        });

};