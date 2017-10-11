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

var bot = new builder.UniversalBot(connector, [
    function(session){
        session.beginDialog('greatings');
    }
]);

bot.dialog('greatings', [
    function(session){
        session.send('Bienvenue dans le bot de réservation');
        session.beginDialog('askName');
    },
    function(session, results){
        session.send(`Salut ${results.response}!`);
        session.beginDialog('reservation');
    }
]);

bot.dialog('askName', [
    function(session){
        builder.Prompts.text(session, 'Comment vous appelez vous ?');
    },
    function(session, results){
        session.endDialogWithResult(results);
    }
]);

bot.dialog('reservation', [
    function(session){
        session.beginDialog('reservationDate');
    },
    function(session){
        session.beginDialog('reservationNbr');
    },
    function(session){
        session.beginDialog('reservationName');
    },
    function(session){
        session.send(`Je récapitule, une réservation le ${session.privateConversationData.reservationDate}, pour une table de ${session.privateConversationData.reservationNbr}, au nom de  ${session.privateConversationData.reservationName}`);
    }
]);

bot.dialog('reservationDate', [
    function(session){
        builder.Prompts.time(session, 'A quelle date voulez-vous réserver ?');
    },
    function(session, results){
        var reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
        session.privateConversationData.reservationDate = reservationDate.toLocaleDateString('fr');
        session.endDialog('J\'ai pris note');
    }
]);

bot.dialog('reservationNbr', [
    function(session){
        builder.Prompts.number(session, 'Une table pour combien de personnes ?');
    },
    function(session, results){
        session.privateConversationData.reservationNbr = results.response;
        session.endDialog('D\'accord');
    }
]);

bot.dialog('reservationName', [
    function(session){
        builder.Prompts.text(session, 'A quel nom est la réservation ?');
    },
    function(session, results){
        session.privateConversationData.reservationName = results.response;
        session.endDialog('C\'est noté');
    }
]);