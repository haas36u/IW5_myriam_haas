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
       // session.beginDialog('greatings');
        session.send('Bienvenue dans le bot de réservation');
        session.beginDialog('mainMenu');
    }
]);

// Main menu
var menuItems = { 
    "Saluer": {
        item: "askName"
    },
    "Effectuer une réservation": {
        item: "reservation"
    },
}

bot.dialog("mainMenu", [
    function(session){
        builder.Prompts.choice(session, "Menu :", menuItems, { listStyle: builder.ListStyle.list });
    },
    function(session, results){
        if(results.response)    session.beginDialog(menuItems[results.response.entity].item);
    }
])
.triggerAction({
    matches: /^main menu$/i,
    confirmPrompt: "Cela annulera votre demande. Etes vous sûr ?"
});

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
        session.send(`Salut ${results.response}!`);
        session.endDialogWithResult(results);
    }
])
.reloadAction(
    "restartAskName", "Ok. Nous allons recommencer.",
    {
        matches: /^start over$/i,
        confirmPrompt: "Cela annulera l'action. Etes vous sûr ?"
    }
)
.cancelAction(
    "cancelReservation", "Ecrivez 'main menu' pour continuer.", 
    {
        matches: /^cancel$/i,
        confirmPrompt: "Cela annulera l'action. Etes vous sûr ?"
    }
);

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
    function(session) {
        session.beginDialog('reservationPhone');
    },
    function(session){
        session.send(`Je récapitule : <br> Une réservation le ${session.privateConversationData.reservationDate}, <br>pour une table de ${session.privateConversationData.reservationNbr}, <br>au nom de ${session.privateConversationData.reservationName} <br> et nous pouvons vous contacter au ${session.privateConversationData.reservationPhone}`);
    }
])
.reloadAction(
    "restartReservation", "Ok. Nous allons recommencer.",
    {
        matches: /^start over$/i,
        confirmPrompt: "Cela annulera votre commande. Etes vous sûr ?"
    }
)
.cancelAction(
    "cancelReservation", "Ecrivez 'main menu' pour continuer.", 
    {
        matches: /^cancel$/i,
        confirmPrompt: "Cela annulera votre commande. Etes vous sûr ?"
    }
);

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

bot.dialog('reservationPhone', [
    function(session, args) {
        if (args && args.reprompt) { builder.Prompts.text(session, "Le format du numéro est invalide, il doit compter 10 chiffres") }
        else                       { builder.Prompts.text(session, "Quel est votre numéro de téléphone ?") }
    },
    function(session, results) {
        var number = results.response;

        if(number.toString().length == 10) {
            session.privateConversationData.reservationPhone = number;
            session.endDialog();
        }
        else { session.replaceDialog('reservationPhone', { reprompt: true })};
    }
]);