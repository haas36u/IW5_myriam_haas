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
    // Check if user is writing something
    bot.on('typing', function(){
        session.send(`haha, t'es en train d'écrire`);
    });

    // doheavywork, wait 10 sec before continue next message
    if(session.message.text === "doheavywork"){
        session.sendTyping();
        session.delay(10000);
        session.send(`I just finished this hard work`);
    } else { // else write some informations
        session.send(`OK, ça fonctionne  !! | [Message.length :  ${session.message.text.length}]`);
        session.send(`DialogData = ${JSON.stringify(session.dialogData)}`);
        session.send(`Session = ${JSON.stringify(session.sessionState)}`);
    }
});

// Send greating message
bot.on('conversationUpdate', message => {
    if (message.membersAdded) {
        var memberName = message.membersAdded.map(function (data) {
            if (data.id !== message.address.bot.id){ // Check if added members is a bot or not
                bot.send(new builder.Message()
                    .address(message.address)
                    .text(`Hello ${data.name}`));
            }
        });
    }
})