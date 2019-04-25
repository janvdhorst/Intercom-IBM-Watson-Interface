//Required modules and files
var express = require('express');
var app = express();
var bl = require('bl');
const handler = require('./main');
var context;
//The app is only listening to the root-url. To add multiple seperations, multiple listeners have to be created. 
app.post('/', function (req, res) {
  var EXPECTED = req.get('x-hub-signature');
  req.pipe(bl(function (err, data) {
    if (err) {
      console.log(err.message)
    }
    var obj = JSON.parse(data.toString())
    //In this section, the intercom message is divided into different intents.
    //the following intents are being forwarded to Watson:
    //user.replied - triggers when a user answers to an existing conversation
    //user.created - triggers when a new conversation is started via the integrated website chat
    if(obj["topic"] == "conversation.user.replied" || obj["topic"] == "conversation.user.created"){
      //All required data is extracted from the intercom webhook object. Refer to the intercom api documentation
      var conversationid = obj.data.item.id;
      var userid = obj.data.item.user.id;
      var message;
      if(obj["topic"] == "conversation.user.replied"){
        message = obj.data.item.conversation_parts.conversation_parts[0].body.substring(3, obj.data.item.conversation_parts.conversation_parts[0].body.length - 4);
        //The handler to process the actual message can be found and edited in main.js
        //It is responsible for communication between intercom and watson. 
        //It also helds responsibility for the integrated user management.
        handler.receive(conversationid,userid,message,"reply");
      }
      if(obj["topic"] == "conversation.user.created"){
        message = obj.data.item.conversation_message.body.substring(3, obj.data.item.conversation_message.body.length - 4);
        handler.receive(conversationid,userid,message,"created");
      }
    }
  }));
  res.sendStatus(200);
});

app.listen(8080, function () {
  console.log('Server started');
});
