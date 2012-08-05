var express = require('express'),
    connect = require('connect'),
    mongoose = require('mongoose'),
    io = require('socket.io');
    Schema = mongoose.Schema,
    config = require('./lib/config'),
    passport =require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    http = require('http');

var  pub = __dirname + '/public';

passport.serializeUser(function(user, done){
  done(null, user);
});

passport.deserializeUser(function(obj, done){
    done(null, user);
});

passport.use(new FacebookStrategy({
      clientID: config.facebook.appId,
      clientSecret: config.facebook.appSecret,
      callbackURL: "http://forgift.jit.su/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done){
      /* User.findOrCreate({facebook: profile.id}, function(err, user){
        return done(err, user);
      }); */
      process.nextTick(function() {
        return done(null, profile);
      });
    }
));

mongoose.connect("mongodb://nodejitsu:562f67fa8e47cd64081d66579e4275ec@alex.mongohq.com:10064/nodejitsudb398284603420");
var app = express.createServer();// Configuration
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {layout: true});
app.use(require('connect').bodyParser());
app.use(app.router);
app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
app.use(express.static(pub));
app.use(express.session({secret: 'teamlevo'}));
app.use(express.cookieParser());


app.get('/', function(req, res){
  console.log(req.user);
  res.render('index');

});

app.get('/auth/facebook',
       passport.authenticate('facebook', {scope: ['user_about_me', 'friends_about_me', 'friends_birthday']}),
       function(req, res){
         //This request will be redirected to FB with extended permissions
       });

app.get('/auth/facebook/callback',
       passport.authenticate('facebook', {
        successRedirect: '/'
        //failRedirect:'/login'
       }));

app.get('/upload', function(req, res){
  res.render('upload');
});


app.listen(3000);
console.log('Express app started on port 3000');


app.get('/', function(req, res){
    res.render('index', {layout: 'layout.jade'});
});


