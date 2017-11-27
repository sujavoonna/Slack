"use strict";

let express = require('express'),
    bodyParser = require('body-parser'),
    auth = require('./modules/slack-salesforce-auth'),
    contact = require('./modules/contact'),
    account = require('./modules/account'),
    opportunity = require('./modules/opportunity'),
    _case = require('./modules/case'),
    whoami = require('./modules/whoami'),
    actions = require('./modules/actions'),
	searchCase = require('./modules/search_case'),
	slackbutton = require('./modules/slack_button'),
	slackmenu = require('./modules/slack_menu'),
	buttonAction = require('./modules/button_action'),
	
    app = express();
    console.log('Express server listening on port ');

app.enable('trust proxy');

app.set('port', process.env.PORT || 5000);

app.use('/', express.static(__dirname + '/www')); // serving company logos after successful authentication

app.use(bodyParser.urlencoded({extended: false}));

app.post('/actions', actions.handle);
app.post('/pipeline', opportunity.execute);
app.post('/contact', contact.execute);
app.post('/searchcase', searchCase.execute);
app.post('/slackbutton', slackbutton.execute);
app.post('/slackmenu', slackmenu.execute);
app.post('/slack/actions', buttonAction.execute);
app.post('/account', account.execute);
app.post('/case', _case.execute);
app.post('/whoami', whoami.execute);
app.post('/login', auth.loginLink);
app.post('/logout', auth.logout);
app.get('/login/:slackUserId', auth.oauthLogin);
app.get('/oauthcallback', auth.oauthCallback);
console.log('Express server listening on port ');

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});