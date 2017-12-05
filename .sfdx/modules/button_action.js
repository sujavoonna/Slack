"use strict";

 let auth = require("./slack-salesforce-auth"),
    force = require("./force");
    require = require('request');
exports.execute = (req, res) => {
	//res.status(200).end() // best practice to respond with 200 status
    var actionJSONPayload = JSON.parse(req.body.payload) // parse URL-encoded payload JSON string
    
   
    
     var reqBody = req.body
    var responseURL = reqBody.url;
    //console.log('url'+responseURL);
    //console.log('---selected name is '+ actionJSONPayload.actions[0].name);
	//console.log('---selected value is '+ actionJSONPayload.actions[0].selected_options[0].value);
   // var session = auth.Session;
   // console.log(session.slackUserId);
    let message = {
        "text": actionJSONPayload.user.name+" clicked: "+actionJSONPayload.actions[0].value,
        "replace_original": false
    }
	console.log('----in button_action, before res.json(message) ');
	
    console.log('---message is ' + message.text);
	//res.json(message);
	
	var actionName = actionJSONPayload.actions[0].name;
   
	//**********************************************************
	 
	let slackUserId = req.body.user_id,
		oauthObj = auth.getOAuthObject(slackUserId),
        subject = "test subject",
        description = "test description";
		//caseId = "500e000000AmhVU",
		//ownerId = "005i0000005PQjt"; // pw
		//ownerId = "00531000006n0UJ"; //VS
		
    
    console.log('----button value is ' + actionJSONPayload.actions[0].value);
	
	var arr = actionJSONPayload.actions[0].value.toString().split("|");
    console.log('testing');
    console.log('----arr[0] is ' + arr[0]);
	console.log('----arr[1] is ' + arr[1]);
    
	var ownerId = arr[0];
	var caseId = arr[1];
    
    force.update(oauthObj, "Case",
        {
            id : caseId,
			subject: "update test -- " + new Date(),
			Slack_Assign_To__c: ownerId,
			ownerId: ownerId,
			Other_Data_Sources__c : "slack"
			
            
        })
        .then(data => {
            let fields = [];
            fields.push({title: "Subject", value: subject, short:false});
			fields.push({title: "OwnerId", value: ownerId, short:false});
            fields.push({title: "Open in Salesforce:", value: oauthObj.instance_url + "/" + caseId, short:false});
            let message = {
                text: "A case's owner and subject have been updated:" + new Date(),
                attachments: [
                    {color: "#F2CF5B", fields: fields
					 
			
					}
                ]
            };
			//console.log('----slack user is ' + slackUserId);
			 
			
			
            res.json(message);
			
			 
        })
        .catch((error) => {
            if (error.code == 401) {
                let fields = [];
                fields.push({title: "UserID", value: ownerId});
                fields.push({title: "CaseID", value:caseId});
                fields.push({title: "visit the URL to login", value: `https://${req.hostname}/login/`+slackUserId});
                
               // var url = req.body.payload;
               console.log('----before res.json(message) ');
               //console.log(res.json(message));
               
               res.json(message);
               //console.log('---message is ' + message);
              
              //sendMessageToSlackResponseURL(responseURL, message)
               //res.send(`Visit the URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId);
                //console.log('url'+url);
                //res.send(url);
            } else {
                res.send("An error as occurred" +error.message);
            }
	});
	}
	
	if (actionName == "case status")
	{		
    
	var arr = actionJSONPayload.actions[0].selected_options[0].value.toString().split("|");
	console.log('----arr[0] is ' + arr[0]);
	console.log('----arr[1] is ' + arr[1]);
	
	var caseStatus = arr[0];
	var caseId = arr[1];
	
    force.update(oauthObj, "Case",
        {
            id : caseId,
			status: caseStatus 
			 
            
        })
        .then(data => {
            let fields = [];
            fields.push({title: "Subject", value: subject, short:false});
            fields.push({title: "Open in Salesforce:", value: oauthObj.instance_url + "/" + caseId, short:false});
            let message = {
                text: "A case's status has been updated:",
                attachments: [
                    {color: "#F2CF5B", fields: fields
					 
			
					}
                ]
            };
			console.log('----slack user is ' + slackUserId);
            //res.json(message);
			sendMessageToSlackResponseURL(responseURL, message)
			 
        })
        .catch((error) => {
            if (error.code == 401) {
                res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId);

            } else {
                res.send("An error as occurred" +error.message);
            }
	});
	}
	//*********************************************************
};

function sendMessageToSlackResponseURL(responseURL, JSONmessage){
    var postOptions = {
        uri: responseURL,
        method: 'get',
        headers: {
            'Content-type': 'application/json'
        },
        json: JSONmessage
    }
    request(postOptions, (error, response, body) => {
        if (error){
            // handle errors as you see fit
        }
    })
}
