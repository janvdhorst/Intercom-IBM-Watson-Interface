Intercom-IBM-Watson Interface
=================

This is a simple interface that connects Intercom to IBM Watson Assistant. 
To use it, you will already need the following things
- an up and running IBM Watson Chatbot
- your IBM Watson API Credentials ([Documentation](https://cloud.ibm.com/apidocs/assistant))
- an Intercom chat embedded to your website. Inboxes have to be activated
- your Intercom API Credentials ([Documentation](https://developers.intercom.com/intercom-api-reference/reference))


Deploy
------------

To *use* the interface, install all required modules via. `npm install`.  
Open the file **main.js**. You will find all required documentation in there. Edit **all** the required variables.  
Start the app via. `node server.js` and set up the intercoom webhooks in your intercom App.  
  
Once the webhooks are successfully coming in, the server will automatically respond.  
**IMPORTANT**: You have to run the Node-Application on **SSL**. It will not work over standard http

Examples
------------

You can test my own chatbot by going to the homepage of [MyWellness](https://mywellness.de) and clicking on the blue box in bottom-right corner.  
Make sure to ask one of the questions provided in my example file, else the conversation will be redirected to an employee.  
You can find a lot of acceptable example questions in the `question-examples.json`
