var mongoose = require('mongoose');

var adAccountDetailsSchema = mongoose.Schema({
  account_status: Number,
  age: Number,
  amount_spent: Number,
  balance: Number,
  business_street: String,
  business_city: String,
  account_id: String,
  currency: String,
  name: String,
  user_role: String,
  business_name: String,
  business_street2: String,
  created_time: Date,
  id: String,
  owner: String,
  timezone_name: String,
  scan_id: String
});

adAccountDetailsModel = mongoose.model('Ad_Account', adAccountDetailsSchema);

module.exports = adAccountDetailsModel
