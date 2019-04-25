//Intercom-IBM Watson interface
//If PRODUCTION_MODE is enabled, the bot will respond to all users.
//If PRODUCTION_MODE is disabled, the bot will only answer to the communication with the given ID (dev-mode)
//To use the development mode, replace the DEV_COMMUNICATION_ID with your own Intercom ID.
var PRODUCTION_MODE = true;
var DEV_COMMUNICATION_ID = "YOUR COMMUNICATION ID";
//Required modules and files
const UserController = require("./UserController");
const nodemailer = require("nodemailer");
const userController = new UserController();
const User = require("./User");
const fs = require('fs');
var Intercom = require('intercom-client');
//REQUIRED CHANGES
//Please change all of the following variables to those of your own cloud environment.
//Refer to the Intercom and IBM Watson API if you don't know how to receive them.
var intercom_token = "YOUR INTERCOM WEBHOOK TOKEN";
var version = "2018-11-20";
var AssistantV1 = require('watson-developer-cloud/assistant/v1');
var workspace_id = 'YOUR IBM WATSON WORKSPACE ID';
var assistant = new AssistantV1({
  username: 'apikey',
  password: 'YOUR API KEY',
  url: 'https://gateway-fra.watsonplatform.net/assistant/api',
  version: version
});
//E-MAIL SETTINGS
//Enter the details of your E-Mail Host.
let transporter = nodemailer.createTransport({
  host: "YOUR EMAIL PROVIDER",
  port: 587,
  secure: false,
  auth: {
    user: "YOUR USERNAME",
    pass: "YOUR PASSWORD"
  }
});

//PUBLIC MODULE
//This is the handler that receives messages from express. The connection is established in the server.js file.
var client = new Intercom.Client({ token: intercom_token });
module.exports = {
  receive: function(conid,userid,message,status){
    if(PRODUCTION_MODE == true || conid == DEV_COMMUNICATION_ID){
      var user = userController.getUserByID(conid);
      if(user != null){
        //USER EXISTS ALREADY
        //WATSON RESPONDS TO MESSAGE NORMALLY
        sendWatsonMessage(message,user);
      }else{
        //USER DOES NOT EXIST
        //CREATE USER
        user = new User(userid,conid,false);
        userController.addUser(user);
        //WATSON RESPOND TO MESSAGE NORMALLY
        sendWatsonMessage(message,user);
      }
    }
  },
  block: function(conid){
    //This function is currently not in use.
    //It is a placeholder for the Intercom 2 API, which is to be released soon.
    var user = userController.getUserByID(conid);
    if(user != null){
      user.setBlocked(true);
    }
  }
}

function sendWatsonMessage(message,user){
  assistant.message(
  {
    input: { text: message },
    workspace_id: workspace_id,
    context: user.getContext()
  },
  function(err, response) {
    if (err) {
      console.error(err);
    } else {
      user.setContext(response.context);
      if(response.output.text == null || response.output.text.length == 0){
        //Do nothing
      }else{
        user.setLastMessage(message);
        sendMessage(user.getConversationId(), user.getUserId(), response.output.text.join("\n"));
        //closeConversation(client, user.getConversationId(), user.getUserId());
      }
    }
  });
}

//This function sends the response which was given by Watson, to Intercom.
//It also handles Escalation (if required)
//Please get the required IDs from the Intercom documentation.
function sendMessage(cid,uid,replyX){
  var jObject = {
    id: cid,
    admin_id: 'YOUR ADMIN ID',
    intercom_user_id: uid,
    body: "<p>" + replyX.toString() + "</p>",
    type: 'admin',
    message_type: 'comment'
  };
  if(replyX.length>1){
    var user = userController.getUserByID(cid);
    if(user != null && user.getBlocked() == true){
      //not yet in use
    }else{
  client.conversations.reply(jObject, function(){
    //ESCALATION
    //To escalate a conversation, set all possible escalation messages delivered by IBM Watson.
    //If you don't want to use escalation, remove the following lines.
    if(replyX.toString() == "Bitte habe einen Moment Geduld, einer meiner Kollegen wird sich gleich bei dir melden. Beachte bitte, dass sie nur von 8 bis 16 Uhr online sind. Du erhältst auf jeden Fall eine E-Mail mit unserer Antwort, falls du deine E-Mail-Adresse hinterlegt hast." || replyX.toString()=="Vielen Dank für deine Nachricht. Leider habe ich nicht verstanden, worum es geht. Bitte hinterlasse deine E-Mail-Adresse und ein Mitarbeiter wird sich am Montag zu Bürozeiten bei dir melden."){
    escalate(cid,uid,user);
    }
  });
    }
  }
}

//This function is not in use
//If you want to use notes on certain events, you can use this function.
function sendNote(cid,uid,replyX){
  var blabla = {
    id: cid,
    admin_id: 'YOUR ADMIN ID',
    intercom_user_id: uid,
    body: "<p>" + replyX.toString() + "</p>",
    type: 'admin',
    message_type: 'note'
  };
  if(replyX.length>1){
  client.conversations.reply(blabla);
  }
}

//This function closes a conversation
//IMPORTANT: If you have set up a rating system in Intercom, it will be triggered immediately after this function.
//Make sure there are no more open requests.
function closeConversation(client,cid,uid){
  var reply = {
  id: cid,
  admin_id: 'YOUR ADMIN ID',
  intercom_user_id: uid,
  type: 'admin',
  message_type: 'close'
  }
  client.conversations.reply(reply);
}

//This function handles the user escalation.
//Example: If the bot does not understand the users intent, it will escalate to a manual user. A human.
//Also the message that led to the escalation will be saved in a file.
//This file will be sent via mail to the given adress every 12 hours.
function escalate(cid,uid,user){
  var assignment = {
    id: cid,
    type: 'admin',
    intercom_user_id: uid,
    admin_id: 'YOUR ADMIN ID',
    assignee_id: 'ASSIGNEE ADMIN ID',
    message_type: 'assignment'
  };
    client.conversations.reply(assignment);
    fs.appendFile('escalate.txt', user.getLastMessage() + '\n', (err) => {  
      if (err) throw err;
      console.log('The escalates were updated!');
  });
}

//EMAIL INTERVAL SETTINGS
var minutes = 720, the_interval = minutes * 60 * 1000;
setInterval(function() {
  sendMail();
}, the_interval);

//SEND MAIL
function sendMail(){
  let mailOptions = {
    from: '"Chatbot XX" <Sender Email>', // sender address
    to: "RECEIVER EMAIL", // list of receivers
    subject: "Escalations", // Subject line
    html: "ANY BODY", // html body
    attachments: [
        {
            filename: 'escalate.txt',
            path: 'escalate.txt'
        }
    ]
  };

  // send mail with defined transport object and remove the file.
transporter.sendMail(mailOptions);
setTimeout(function(){
  fs.unlinkSync('escalate.txt');
},30000);
//
}