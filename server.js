var express = require('express'),
    connect = require('connect'),
    mongoose = require('mongoose'),
    everyauth = require('everyauth'),
    config = require('./lib/config'),
    mongose = require("mongoose"),
    Schema = mongoose.Schema,
    http = require('http');

var  pub = __dirname + '/public';

var usersByFbId = {};

everyauth.debug = true;

mongoose.connect("mongodb://nodejitsu:562f67fa8e47cd64081d66579e4275ec@alex.mongohq.com:10064/nodejitsudb398284603420");


var app = module.exports = express.createServer(
      express.bodyParser(),
      express.static(__dirname + "/public"),
      express.cookieParser(),
      express.errorHandler({showStack: true, dumpExceptions: true})
      express.session({secret: 'teamlevo'})
);// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {layout: true});
    app.use(require('connect').bodyParser());
    app.use(app.router);
    app.use(express.static(pub));
    app.use(express.bodyParser());
    app.use(express.static(__dirname + "/public"));
    app.use(express.cookieParser());
    app.use(express.errorHandler({showStack: true, dumpExceptions: true}));
    app.use(express.session({secret: 'teamlevo'}));
    app.use(express.cookieParser);
    app.use(everyauth.middleware());
});


everyauth.helpExpress(app);

app.listen(3000);
console.log('Express app started on port 3000');


app.get('/', function(req, res){
    res.render('index', {layout: 'layout.jade'});
});
