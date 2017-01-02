var mongoose = require('mongoose');

var postGeneralMetricsSchema = mongoose.Schema({
  caption: String,
  from: {},
  full_picture: String,
  icon: String,
  id: String,
  instagram_eligibility: String,
  is_expired: Boolean,
  is_hidden: Boolean,
  is_instagram_eligible: Boolean,
  is_popular: Boolean,
  is_published: Boolean,
  is_spherical: Boolean,
  link: String,
  status_type: String,
  message: String,
  name: String,
  description: String,
  created_time: Date,
  updated_time: Date,
  type: String,
  status_type: String,
  story: String,
  story_tags: [],
  timeline_visibility: String,
  type: String,
  picture: String,
  permalink_url: String,
  privacy: {},
  promotion_status: String,
  page_id: String,
  scan_id: String,
  currency: {}
});

postGeneralMetricsModel = mongoose.model('Post_General_Metrics', postGeneralMetricsSchema);

module.exports = postGeneralMetricsModel
