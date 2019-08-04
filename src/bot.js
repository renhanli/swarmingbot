'use strict';

module.exports.setup = function(app) {
    var builder = require('botbuilder');
    var teams = require('botbuilder-teams');
    var config = require('config');
    const fs = require('fs');
    
    //get all the supported teams from data/teams.json
    const teamsdata = JSON.parse(fs.readFileSync("data/teams.json"));
    var suportteams = teamsdata.teams;
    //get all the supported teams from data/regions.json
    const regionsdata = JSON.parse(fs.readFileSync("data/regions.json"));
    var suportregions = regionsdata.regions;
    //get contacts data/contacts.json
    const contactsdata = JSON.parse(fs.readFileSync("data/contacts.json"));
    //get kudos data/kudos.json
    const kudosdata = JSON.parse(fs.readFileSync("data/kudos.json"));

    if (!config.has("bot.appId")) {
        // We are running locally; fix up the location of the config directory and re-intialize config
        process.env.NODE_CONFIG_DIR = "../config";
        delete require.cache[require.resolve('config')];
        config = require('config');
    }
    // Create a connector to handle the conversations
    var connector = new teams.TeamsChatConnector({
        // It is a bad idea to store secrets in config files. We try to read the settings from
        // the config file (/config/default.json) OR then environment variables.
        // See node config module (https://www.npmjs.com/package/config) on how to create config files for your Node.js environment.
        appId: config.get("bot.appId"),
        appPassword: config.get("bot.appPassword")
    });
    
    var inMemoryStorage = new builder.MemoryBotStorage();

    var bot = new builder.UniversalBot(connector, [
        function (session) {
            session.send("Welcome to Swarming bot!");
            session.beginDialog('askForTeam');
        },
        function (session, results) {
            session.dialogData.team = results.response.entity;
            session.beginDialog('askForRegion');
        },
        function (session, results) {
            session.dialogData.region = results.response.entity;
            session.send(`Here are the ones you are looking for: <br/>Team: ${session.dialogData.team} <br/>Region: ${session.dialogData.region}`);
            session.send(`<b>TAs</b>:`+ showAliasList(getTAs(contactsdata,session.dialogData.team,session.dialogData.region)));
            session.send(`<b>SEs</b>:`+ showAliasList(getSEs(contactsdata,session.dialogData.team,session.dialogData.region)));
            session.beginDialog('askForKudos');
        },
        function (session, results) {
            session.dialogData.alias = results.response;
            setKudo(kudosdata,session.dialogData.alias);
            // Process request and display reservation details
            session.send(`Thank you! Kudo added to your hero: <br/> ${session.dialogData.alias}`);
            session.endDialog();
        }
    ]).set('storage', inMemoryStorage); // Register in-memory storage 
    
    // Dialog to ask for Team name
    bot.dialog('askForTeam', [
        function (session) {
            builder.Prompts.choice(session, "Which support team?",suportteams, { listStyle: 3 });
        },
        function (session, results) {
            session.endDialogWithResult(results);
        }
    ]);
    
    // Dialog to ask for team region
    bot.dialog('askForRegion', [
        function (session) {
            builder.Prompts.choice(session, "Which region?", suportregions, { listStyle: 3 });
        },
        function (session, results) {
            session.endDialogWithResult(results);
        }
    ])
    
    // Dialog to ask for support engineer alias
    bot.dialog('askForKudos', [
        function (session) {
            builder.Prompts.text(session, "</b>I am ready to send Kudos your swarming heros. <br/>Please provide Alias:");
        },
        function (session, results) {
            session.endDialogWithResult(results);
        }
    ]);

   //Dialog for quit tirgger
    bot.dialog('quit', [
        function(session) {
            console.log('enter quit func');
            session.endConversation("Quit Conversation");
        }
    ])
    .triggerAction({
        matches: /^quit/i,
        onSelectAction: (session, args, next) => {
            // Add the help dialog to the dialog stack 
            // (override the default behavior of replacing the stack)
            session.beginDialog(args.action, args);
        }
    });


    // Setup an endpoint on the router for the bot to listen.
    // NOTE: This endpoint cannot be changed and must be api/messages
    app.post('/api/messages', connector.listen());

    // Export the connector for any downstream integration - e.g. registering a messaging extension
    module.exports.connector = connector;
};

function getTAs(contactsdata,team,region){
    var result;
    contactsdata.forEach(function(element){
        if(element.team==team && element.region==region){
            result=element.tas;
        }
    });
    return result;
}

function getSEs(contactsdata,team,region){
    var result;
    contactsdata.forEach(function(element){
        if(element.team==team && element.region==region){
            result=element.ses;
        }
    });
    return result;
}

function showAliasList(namelist){
    var msg = "";
    if (namelist === undefined || namelist.length == 0) {
        msg = "Sorry, no one available in the required team";
    }else{
        namelist.forEach(function(name){
            msg += "<br/>"+name;
          });
    }
    return msg;
}

function setKudo(kudosdata,alias){

}