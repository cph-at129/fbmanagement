var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user.model');

module.exports = function (passport, config) {

  var strategy = new FacebookStrategy({
      clientID: config.facebookAuth.clientID,
      clientSecret: config.facebookAuth.clientSecret,
      callbackURL: config.facebookAuth.callbackURL
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOne({
        'facebook.id': profile.id
      }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (user) { // if the user is found, then log them in
          return done(null, user);
        } else {
          var newUser = new User();
          newUser.facebook.clientID = config.facebookAuth.clientID;
          newUser.facebook.clientSecret = config.facebookAuth.clientSecret;
          newUser.facebook.callbackURL = config.facebookAuth.redirectUri + config.facebookAuth.callbackURL;
          newUser.facebook.id = profile.id;
          newUser.facebook.token = accessToken;
          newUser.facebook.refreshToken = refreshToken;
          newUser.facebook.name = profile.displayName;
          newUser.facebook.email = '';
          if (profile.emails) {
            newUser.facebook.email = profile.emails[0].value;
          }
          newUser.save(function (err) {
            if (err) {
              throw err;
            }
            return done(null, newUser);
          });
        }
      });
    }
  );

  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.facebook.id);
  });

  passport.deserializeUser(function (id, done) {
    User.find({
      'facebook.id': id
    }, function (err, user) {
      done(err, user);
    });

  });
  passport.use(strategy);
};
