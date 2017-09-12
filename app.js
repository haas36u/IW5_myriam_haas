var builder = require('botbuilder');
var restify = require('restify');

// restify server
var server = restify.createServer();
server.listen(process.env.port || 3978, function(){
    console.log(`server name:  ${server.name} | server url: ${server.url}`);
});

var connector = new builder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_PASSWORD
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function(session){
    
    bot.on('conversationUpdate', function (message) {
        if (message.membersAdded) {
                   bot.send(`Ok`);
                   session.send(`okok`);
        }
    });

    //Détecte si l'utilisateur écrit quelque chose
    bot.on('typing', function(){
        session.send(`haha, t'es en train d'écrire`);
    });

    //doheavywork, attends 10 sec avant de continuer la suite de message
    if(session.message.text === "doheavywork"){
        session.sendTyping();
        session.delay(10000);
    }

    session.send(`OK, ça fonctionne  !! | [Message.length :  ${session.message.text.length}]`);
    session.send(`DialogData = ${JSON.stringify(session.dialogData)}`);
    session.send(`Session = ${JSON.stringify(session.sessionState)}`);
});

