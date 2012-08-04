var express = require('express'),
    connect = require('connect'),
    mongoose = require('mongoose'),
    everyauth = require('everyauth'),
    config = require('./config'),
    mongose = require("mongoose"),
    Schema = mongoose.Schema,
    http = require('http');

var  pub = __dirname + '/public';

everyauth.debug = true;

mongoose.connect("mongodb://nodejitsu:562f67fa8e47cd64081d66579e4275ec@alex.mongohq.com:10064/nodejitsudb398284603420");

var app = module.exports = express.createServer(
      express.bodyParser(),
      express.static(__dirname + "/public"),
      express.cookieParser(),
      express.session({sercet: 'teamlevo'})
);// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {layout: false});
    app.use(require('connect').bodyParser());
    app.use(app.router);
    app.use(express.static(pub));
    app.set('views', __dirname + '/views');
    app.use(express.cookieParser);
    app.use(everyauth.middleware());
});

everyauth.helpExpress(app);
app.get('/', function(req, res){
  res.render('index');
});

app.listen(3000);
console.log('Express app started on port 3000');
