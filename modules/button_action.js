"use strict";

 let auth = require("./slack-salesforce-auth"),
// user = require ("/.user"),
    force = require("./force");
   
    
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

   console.log('before');
    
          
	//**********************************************************
	 
    let //slackUserId = req.body.user_id,
    slackUserId = actionJSONPayload.user.id,
        oauthObj = auth.getOAuthObject(slackUserId),
        subject = "test subject",
        description = "test description",
        actionName = actionJSONPayload.actions[0].name,
        slackUserName = actionJSONPayload.user.name,
         soql = "Select id from User where Slack_Name__c = '@"+slackUserName+"'";
      
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
    var oldownerId = arr[0];
    var caseId = arr[1];
    force.query(oauthObj, soql)
    .then(data => { 
        let users = JSON.parse(data).records;
        if (users && users.length>0)
        {
           var userId = users[0].Id;
            console.log('userID'+userId);
            //force.update(oauthObj, "Case",
            
            force.apexrest(oauthObj,"/ClaimCase?sfuserid="+userId+"&"+"caseid="+caseId,
            {
                //id : caseId,
                //subject: "update test -- " + new Date(),
               // Slack_Assign_To__c: userId,
                //ownerId: userId,
                //Other_Data_Sources__c : "slack"
               // "sfuserid":userId,
                //"caseid":caseId

                
                
            })
            .then(data=> {
                 let casereturnInfo = JSON.parse(data),
                statusMessage = "";         
                 console.log(casereturnInfo.requestSFUser.Type+casereturnInfo.requestSFUser.SlackName+"Message2"+casereturnInfo.Message);
                if(casereturnInfo.Success)
                {statusMessage = "Case's owner  have been updated"}
                else
                {statusMessage = "Case's owner  have not been updated"};
                
                let fields = [];
                /*fields.push({title: "Subject", value: subject, short:false});
                fields.push({title: "oldOwnerId", value: oldownerId, short:false});
                fields.push({title: "newOwnerId", value: userId, short:false});*/
                fields.push({title: "Update Status Reason", value: casereturnInfo.Status, short:false});
                if(!casereturnInfo.Success)
                {fields.push({title: "Update Status Message ", value: casereturnInfo.Message, short:false});};
                fields.push({title: "OldOwner", value: casereturnInfo.oldCaseOwner.Name, short:false});
                fields.push({title: "RequestedUser", value: casereturnInfo.requestSFUser.Name, short:false})
                fields.push({title: "Open in Salesforce:", value: oauthObj.instance_url + "/" + caseId, short:false});
                let message = {
                   // text: "A case's owner and subject have been updated:" + new Date(),
                   text:statusMessage,
                    attachments: [
                        {color: "#F2CF5B", fields: fields
                         
                
                        }
                    ]
                };
                console.log('----slack user is ' + slackUserId);
                 
                
                
                res.json(message);
                
                 
            })
            .catch((Error) => {
                if (Error.code == 401) {
                    let fields = [];
                    fields.push({title: "UserID", value: oldownerId+"Test"});
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
                                "value": oldownerId+'|'+caseId
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
                    res.send("An error as occurred" +Error.Message);
                }
        });
        
        }
    })
    .catch((error) => {
        if (error.code == 401) {
            let fields = [];
            fields.push({title: "UserID", value: oldownerId+"Test"});
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
                        "value": oldownerId+'|'+caseId
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
           //return;
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
function getUserId(oauthObj, soql) 
{   
        
        force.query(oauthObj, soql)
        .then(data => { 
            let users = JSON.parse(data).records;
            if (users && users.length>0)
            {
                userId = users[0].Id
                console.log('useridfunction'+userId);
            }
            return userId;
               })
            .catch((error) => {
                if (error.code == 401) {
                    //res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId);
                    return;
                } else {
                   // res.send("An error as occurred" +error.message);
                   return;
                }
            });
        
    
}
