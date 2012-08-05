var express = require('express'),
    connect = require('connect'),
    mongoose = require('mongoose'),
    everyauth = require('everyauth'),
    fs = require("fs"),
    cloudfiles = require("cloudfiles"),
    socket = require('socket.io'),
    Schema = mongoose.Schema,
    config = ('./lib/config'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    http = require('http'),
    rest = require('restler');


var  pub = __dirname + '/public';

var portInUse, cloudConf, cloud,
    app = express.createServer(),
    io = socket.listen( app );


if ( process.env.NODE_ENV ) {
  cloudConf = JSON.parse( fs.readFileSync( __dirname + "/.config", "utf-8" ) );

  cloud = cloudfiles.createClient({
    auth: {
      username: cloudConf.username,
      apiKey: cloudConf.apiKey
    }
  });

  cloud.setAuth(function() {
    console.log( "Authorized Cloud Files" );
   });
}


var  pub = __dirname + '/public';

passport.use(new FacebookStrategy({
      clientID: config.facebook.appId,
      clientSecret: config.facebook.appSecret,
      callbackURL: "http://forgift.jit.su/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done){
      User.findOrCreate({facebook: profile.id}, function(err, user){
        return done(err, user);
      });
    }
));

mongoose.connect("mongodb://nodejitsu:562f67fa8e47cd64081d66579e4275ec@alex.mongohq.com:10064/nodejitsudb398284603420");
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {layout: true});
app.use(require('connect').bodyParser());
app.use(app.router);
app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
app.use(express.static(pub));
app.use(express.session({secret: 'teamlevo'}));
app.use(express.cookieParser());

var connections = {
};

io.set( "log level", 1 );io.sockets.on( "connection", function( client ) {

  client.on( "init", function( data ) {

    connections[ data.id ] = true;

    io.sockets.emit( "initialized", data );
  });

  client.on( "capture", function( data ) {

    var file, buffer,
        filename = data.id + "-" + Date.now() + ".png",
        filepath = "public/saved/" + filename;

    buffer = new Buffer( data.captured.replace(/^data:image\/\w+;base64,/, ""), "base64" );

    file = fs.openSync( filepath, "w+" );

    fs.write( file, buffer, 0, buffer.length, 0, function( err, data ) {
      if ( err == null ) {

        if ( cloud ) {
          cloud.addFile( cloudConf.container, { remote: filename, local: filepath }, function( err, uploaded ) {
            if ( uploaded ) {
              console.log( "Uploaded to Cloud Files: " + filename  );
              streamToClient([ filename ]);
            }
          });
        } else {
          rest.post('https://snapi.sincerely.com/shiplib/upload', {
              data: {appkey:"NJ4JVDDPXKGO1K0W5L2MDO3SXK3Q5K4MJY75OQRE", photo: file},
          }).on('complete', function(data, response) {
              if (response.statusCode == 200) {
               console.log(data.id, data.error);
              }
              else{
                console.log(response, data.error);
              }
            });
          streamToClient([ filename ]);
        }

      }
    });
  });

  client.on( "list:request", streamList );

  function streamList( data ) {
    var id = data.id,
        filepath = "public/saved/";

    if ( cloud ) {
      cloud.getContainer( cloudConf.container, function( err, container ) {
        container.getFiles(function( err, files ) {
          streamFilter( id, files.map(function( data ) { return data.name; }) );
        });
      });
    } else {
      fs.readdir( filepath, function( err, files ) {
        streamFilter( id, files );
      });
    }
  }

  function streamFilter( id, files ) {
    var size,
        list = [];

    files = files.filter(function( file ) { return (new RegExp("^" + id )).test( file ); });
    size = files.length;

    files.forEach(function( file, index ) {
      list.push( file );

      if ( index % 5 === 0 || index === size - 1 ) {
        streamToClient( list );

        list = [];
      }
    });
  }

  function streamToClient( list ) {
    io.sockets.emit( "list:response", {
      path: cloud ? "http://c309459.r59.cf1.rackcdn.com/" : "/saved/",
      files: list
    });
  }
});

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
        successRedirect: '/',
        failRedirect:'/login'
       }));

app.get('/upload', function(req, res){
  res.render('upload');
});


app.listen(3000);
console.log('Express app started on port 3000');


app.get('/', function(req, res){
    res.render('index', {layout: 'layout.jade'});
});


