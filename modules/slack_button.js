"use strict";

 

exports.execute = (req, res) => {
	//res.status(200).end() // best practice to respond with empty 200 status code
	console.log('----place 1 ');
    //var reqBody = req.body
	console.log('----place 2 ');
    //var responseURL = reqBody.response_url
    //console.log('----place 3 responseURL is ' + responseURL);
    console.log('token'+req.body.token);
   // if (req.body.token != "qAuoAiwY3kSaSC076U3EfkNr"){
    if (req.body.token != "G71rMxxm98XZqsLumH8rjM0f"){
		console.log('----place 4 ');
        res.status(403).end("Access forbidden")
    }else{
        let slackUserId = req.body.user_id;
		console.log('----place 5, slackUserId is  ' + slackUserId);
		let message = {
            "text": "This is your interactive message",
            "attachments": [
                {
                    "text": "Click the button to update the case subject",
                    "fallback": "Damn it didn't work",
                    "callback_id": "button_test",
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "actions": [
                        {
                            "name": "case button",
                            "text": "Update Case Subject",
                            "type": "button",
                            "value": slackUserId
                        }
                    ]
                }
            ]
        };
        //sendMessageToSlackResponseURL(responseURL, message)
		console.log('----before res.json(message) ');
		//console.log('---message is ' + message);
		console.log(res.json(message));
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