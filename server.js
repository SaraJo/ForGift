var express = require('express'),
    connect = require('connect'),
    everyauth = require('everyauth'),
    config = require('./config');

var  pub = __dirname + '/public';

everyauth.debug = true;

var app =express.createServer();// Configuration

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {layout: false});
app.use(require('connect').bodyParser());
app.use(app.router);
app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
app.use(express.static(pub));


app.get('/', function(req, res){
  res.render('index');
});

app.listen(3000);
console.log('Express app started on port 3000');
