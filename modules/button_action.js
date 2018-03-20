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
  
   console.log('before'+actionJSONPayload.original_message.attachments); 
    
          
	//**********************************************************
	 
    let //slackUserId = req.body.user_id,
    slackUserId = actionJSONPayload.user.id,
        oauthObj = auth.getOAuthObject(slackUserId),
       // subject = "test subject",
        description = "test description",
        actionName = actionJSONPayload.actions[0].name,
        slackUserName = actionJSONPayload.user.name,
        soql = "Select id from User where isactive = true and Slack_Name__c = '@"+slackUserName+"'"; 
      
        //console.log('userid1'+userid);
    if (actionName == "case button")
	{		
    console.log('----button value is ' + actionJSONPayload.actions[0].value);
         
	var arr = actionJSONPayload.actions[0].value.toString().split("|");
	console.log('----arr[0] is ' + arr[0]);
    console.log('----arr[1] is ' + arr[1]);  
    var caseassignee = arr[0];
    var subject = arr[1];
    var caseId = arr[2];
    var createdBy = arr[3];
    var caseNumber = arr[4];
    force.query(oauthObj, soql)
    .then(data => { 
        let users = JSON.parse(data).records;
        if (users && users.length>0)
        {
           var userId = users[0].Id;
            console.log('userID'+userId);
            //force.update(oauthObj, "Case",
            
           /// force.apexrest(oauthObj,"/ClaimCase?sfuserid="+userId+"&"+"caseid="+caseId,
           if(caseassignee == 'MySelf')
           {
            caseassignee = userId;
           }
           console.log('caseassignee'+caseassignee);
           force.apexrest(oauthObj,"/ClaimCase?sfuserid="+caseassignee+"&"+"caseid="+caseId,
            {
                   
                
            })
            .then(data=> {
                 let casereturnInfo = JSON.parse(data),
                statusMessage = "";         
                 console.log(casereturnInfo.requestSFUser.Type+casereturnInfo.requestSFUser.SlackName+"Message2"+casereturnInfo.Message);
                /*if(casereturnInfo.Success)
                {statusMessage = (caseId).bold()+" Case's owner  has now been claimed by :"+casereturnInfo.requestSFUser.Name}
                else
                {statusMessage =(caseId).bold()+ " has already been claimed by:"+casereturnInfo.oldCaseOwner.Name}; */
                console.log("--subject"+subject)
                let fields = [];
               if(!casereturnInfo.Success) 
                { fields.push({title:"Case#: "+ casereturnInfo.oldCaseInfo.CaseNum+" has already been claimed by "+casereturnInfo.oldCaseOwner.Name, value:"", short:false});}
              else
                {fields.push({title: "Case#: "+casereturnInfo.oldCaseInfo.CaseNum +" has now been claimed by "+casereturnInfo.requestSFUser.Name, value:"", short:false});};
              if(subject !== "nosubject")
                fields.push({title: "Case Subject: "+subject, value: "", short:false});
              else   
                fields.push({title: "Case Subject: "+"", value: "", short:false});
                fields.push({title: "Submitted By: "+createdBy, value: "", short:false});
              
                fields.push({title: "Go to Case: ", value: oauthObj.instance_url + "/" + caseId, short:false});
                let message = {
                   // text: "A case's owner and subject have been updated:" + new Date(),
                  // text:statusMessage,
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
                    console.log("--subject"+subject);
                    fields.push({title: "CaseID : " +caseId, value:""});
                    if(subject !== "nosubject")
                        fields.push({title: "Case Subject : "+subject, value: ""});
                    else    
                    fields.push({title: "Case Subject: "+"", value: "", short:false});
                    fields.push({title: "Case Creator : "+createdBy, value: "", short:false});
                    fields.push({title: "visit the URL to login and Authenticate", value: `https://${req.hostname}/login/`+slackUserId});
                    let message = {
                         attachments: [
                            {color: "#F2CF5B", fields: fields,
                            "text": "Click the button again to  claim the case",
                            "callback_id":"button_test",
                            "attachment_type": "default",
                            "actions": [ 
                                
                               {
                                "name": "case button",
                                "text": "Assign Case",
                                "fallback": "damn!!!!! ",
                                "style":"Danger",
                                "type": "button",
                                "value": caseassignee+'|'+subject+'|'+caseId+'|'+createdBy+'|'+caseNumber
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
            console.log("--subject"+subject);
            let fields = [];
            fields.push({title: "Case#: " +caseNumber+" has been created and assigned to Queue", value:""});
            if(subject !== "nosubject")
                fields.push({title: " Case Subject: "+subject, value: ""});
            else
                fields.push({title: "Case Subject: "+"", value: "", short:false});
            fields.push({title: "Submitted By: "+createdBy, value: "", short:false});
            fields.push({title: "visit the URL to login and Authenticate", value: `https://${req.hostname}/login/`+slackUserId});
            let message = {
                 attachments: [
                    {color: "#F2CF5B", fields: fields,
                    "text": "Click the button again to  claim the case",
                    "callback_id":"button_test",
                    "attachment_type": "default",
                    "actions": [ 
                        
                       {
                        "name": "case button",
                        "text": "Assign Case",
                        "fallback": "damn!!!!! ",
                        "style":"Danger",
                        "type": "button",
                        "value": caseassignee+'|'+subject+'|'+caseId+'|'+createdBy+'|'+caseNumber
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
                    {color: "#F2CF5B", fields: fields,
                   
			
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
    
    if (actionName == "case user")
    {		
    
        var arr = actionJSONPayload.actions[0].selected_options[0].value.toString().split("|");
        
        var arrOption =  actionJSONPayload.original_message.attachments[0].actions[0].options; 
        console.log('----arr[0] is ' + arr[0]);
        console.log('----arr[1] is ' + arr[1]);
        console.log('----arr[2] is ' + arr[2]);
        console.log('----options is ' +  actionJSONPayload.original_message.attachments[0].actions[0].options[0].value);

        var caseassignee = arr[0];
        var caseId = arr[1];
        var subject = "";
        if(arr[2] !== "null"  )
         subject = arr[2];
        else
          subject = "nosubject" ;
       // var subject = arr[2];
        var createdBy = arr[3];
        var caseNumber = arr[4];
        console.log("subject"+subject);
        force.apexrest(oauthObj,"/ClaimCase?sfuserid="+caseassignee+"&"+"caseid="+caseId,
        {
               
            
        })
        .then(data=> {
            let casereturnInfo = JSON.parse(data),
            statusMessage = "";         
             console.log(casereturnInfo.requestSFUser.Type+casereturnInfo.requestSFUser.SlackName+"Message2"+casereturnInfo.Message);
            /*if(casereturnInfo.Success)
            {statusMessage = (caseId).bold()+" Case's owner  has now been claimed by :"+casereturnInfo.requestSFUser.Name}
            else
            {statusMessage =(caseId).bold()+ " has already been claimed by:"+casereturnInfo.oldCaseOwner.Name}; */
            console.log("--subject"+subject)
            let fields = [];
           if(!casereturnInfo.Success) 
            { fields.push({title:"Case#: "+ casereturnInfo.oldCaseInfo.CaseNum+" has already been claimed by "+casereturnInfo.oldCaseOwner.Name, value:"", short:false});}
          else
            {fields.push({title: "Case#: "+casereturnInfo.oldCaseInfo.CaseNum +" has now been claimed by "+casereturnInfo.requestSFUser.Name, value:"", short:false});};
          if(subject !== "nosubject")
            fields.push({title: "Case Subject: "+subject, value: "", short:false});
          else   
            fields.push({title: "Case Subject: "+"", value: "", short:false});
            fields.push({title: "Submitted By: "+createdBy, value: "", short:false});
          
            fields.push({title: "Go to Case: ", value: oauthObj.instance_url + "/" + caseId, short:false});
            let message = {
                attachments: [
                    { 
                        color: "#F2CF5B", fields: fields
                     
            
                    }
                    
                ]
            }
            console.log('----before'+ message );
            // console.log(res.json(message));
             res.json(message);
        })
        
      
    }
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
