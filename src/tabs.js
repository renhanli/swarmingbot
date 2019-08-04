'use strict';

module.exports.setup = function(app) {
    const fs = require('fs');
    var path = require('path');
    var express = require('express')
    
    //get all the supported teams from data/teams.json
    var kudodata = JSON.parse(fs.readFileSync("data/kudos.json"));
    
    // Configure the view engine, views folder and the statics path
    app.use(express.static(path.join(__dirname, 'static')));
    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, 'views'));
    
    // Setup home page
    app.get('/', function(req, res) {
        //var users = [{"k":"jone","v":"1"},{"k":"jane","v":"2"}];
        res.render('hello',{kudos: kudodata});
    });
    
    // Setup the static tab
    app.get('/hello', function(req, res) {
        res.render('hello',{kudos: kudodata});
    });
    
    // Setup the configure tab, with first and second as content tabs
    app.get('/configure', function(req, res) {
        res.render('configure');
    });    

    app.get('/first', function(req, res) {
        res.render('first');
    });
    
    app.get('/second', function(req, res) {
        res.render('second');
    });    
};