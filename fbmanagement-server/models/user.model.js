var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  currentToken: String,
  facebook: {
    clientID: String,
    clientSecret: String,
    callbackURL: String,
    id: String,
    token: String,
    refreshToken: String,
    name: String,
    email: String,
    currency: {},
    adAccounts: []
  }
});

module.exports = mongoose.model('User', userSchema);
