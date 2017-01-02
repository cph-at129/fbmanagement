var logger = require('morgan');
var cors = require('cors');
var http = require('http');
var https = require('https');
var fs = require('fs');
var express = require('express');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var config;
//*************** ENVIRONMENT *********************************
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
setConfigs();
//********************* DB ************************************************
mongoose.connect(config.mongodb, function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }
});
//******************** PASSPORT *******************************************
require('./config/passport')(passport,config);
//********************* EXPRESS CONFIGURATION *****************************
var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser())
app.use(session({
  secret: config.session_secret,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cors());
  //*********** LOGGER **************************
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//*************** ROUTING ********************
require('./routes/api')(app, passport, config);
//************** SERVER **********************
switch (process.env.NODE_ENV) {
  case 'development':
    startDevelopmentServer();
    break;
  case 'production':
    http.createServer(app).listen(3001);
    break;
  case 'preview':
    http.createServer(app).listen(3001);
    break;
  default:
    startDevelopmentServer();
}

//********** HELPER FUNCTIONS ***************************************
function startDevelopmentServer() {
  https.createServer({
    key: fs.readFileSync(__dirname + '/config/ssl/key.pem', 'utf8'),
    cert: fs.readFileSync(__dirname + '/config/ssl/server.crt', 'utf8'),
    requestCert: false,
    rejectUnauthorized: false
  }, app).listen(3001, () => {
    console.log('https server listening on port ' + 3001);
  });
}

function setConfigs() {
  switch (process.env.NODE_ENV) {
    case 'development':
      config = require('./config/dev_config');
      var randomIndex = getRandomInt(0, config.facebookAuthApps.length);
      config.facebookAuth = config.facebookAuthApps[randomIndex];
      break;
    case 'production':
      config = require('./config/prod_config');
      break;
    case 'preview':
      config = require('./config/prev_config');
      break;
    default:
      config = require('./config/dev_config');
      var randomIndex = getRandomInt(0, config.facebookAuthApps.length);
      config.facebookAuth = config.facebookAuthApps[randomIndex];
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
