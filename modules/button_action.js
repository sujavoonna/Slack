"use strict";

 let auth = require("./slack-salesforce-auth"),
    force = require("./force");
     var sess;
exports.execute = (req, res) => {
	//res.status(200).end() // best practice to respond with 200 status
    var actionJSONPayload = JSON.parse(req.body.payload) // parse URL-encoded payload JSON string
	console.log('---selected name is '+ actionJSONPayload.actions[0].name);
	//console.log('---selected value is '+ actionJSONPayload.actions[0].selected_options[0].value);
    
    let message = {
        "text": actionJSONPayload.user.name+" clicked: "+actionJSONPayload.actions[0].value,
        "replace_original": false
    }
	console.log('----in button_action, before res.json(message) ');
	
    console.log('---message is name' + actionJSONPayload.user.name+'id'+actionJSONPayload.user.id);
	//res.json(message);
	//console.log('token'+req.body.token);
	var actionName = actionJSONPayload.actions[0].name;
    var slackUserName = actionJSONPayload.user.name;
    var slackUserId = actionJSONPayload.user.id;
    var soql = "Select id from User where Slack_Name__c = '@"+slackUserName+"'";
    //var soql = "Select id from User ";//where Slack_Name__c = '@"+slackUserName+"'";
    var oauthObj = auth.getOAuthObject(slackUserId);
   console.log('before');
    var userId ;
    function getUserId(oauthObj, soql,callback) 
    {   
            
            force.query(oauthObj, soql)
            .then(data => { 
                let users = JSON.parse(data).records;
                if (users && users.length>0)
                {
                    userId = users[0].Id
                    console.log('useridfunction'+userId);
                }
            });
            return (userId);
        
    }
    
    getUserId(oauthObj, soql);
    console.log('useridretunr'+userId);
       
	//**********************************************************
	 
	let //slackUserId = req.body.user_id,
		//oauthObj = auth.getOAuthObject(slackUserId),
        subject = "test subject",
        description = "test description";
        //sess1 = auth.sess.user;
        //caseId = "500e000000AmhVU",
		//ownerId = "005i0000005PQjt"; // pw
		//ownerId = "00531000006n0UJ"; //VS
       
        //console.log('userid1'+userid);
    if (actionName == "case button")
	{		
    console.log('----button value is ' + actionJSONPayload.actions[0].value);
         
	var arr = actionJSONPayload.actions[0].value.toString().split("|");
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
			console.log('----slack user is ' + slackUserId);
			 
			
			
            res.json(message);
			
			 
        })
        .catch((error) => {
            if (error.code == 401) {
                let fields = [];
                fields.push({title: "UserID", value: ownerId+"Test"});
                fields.push({title: "CaseID", value:caseId});
                fields.push({title: "visit the URL to login", value: `https://${req.hostname}/login/`+slackUserId});
                let message = {
                     attachments: [
                        {color: "#F2CF5B", fields: fields,
                        "text": "Click the button again to  claim the case",
                        "callback_id":"button_test",
                        "attachment_type": "default",
                        "actions": [ 
                            
                           {
                            "name": "case button",
                            "text": "Update Case Button From SF",
                            "fallback": "damn!!!!! ",
                            "style":"Danger",
                            "type": "button",
                            "value": ownerId+'|'+caseId
                           }
                        ] 
                     }
                    ]             
                 } 
               // var url = req.body.payload;
               console.log('----before res.json(message) ');
              // console.log(res.json(message));
               res.json(message);

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
            res.json(message);
			
			 
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
/*
function sendMessageToSlackResponseURL(responseURL, JSONmessage){
    var postOptions = {
        uri: responseURL,
        method: 'POST',
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
*/
