module.exports = {
  'facebookAuthApps': [{
    'clientID': '168693576928268',
    'clientSecret': '00410c8a498b9ab313f5c2009a45835c',
    'callbackURL': '/auth/facebook/callback',
    'redirectUri': 'https://fbmanagement.mjdev.eu'
  }, {
    'clientID': '627451074109056',
    'clientSecret': 'b6c154fb6b233fc6f46a34b34828ef89',
    'callbackURL': '/auth/facebook/callback',
    'redirectUri': 'https://fbmanagement.mjdev.eu'
  }, {
    'clientID': '380758775601433',
    'clientSecret': '29a16da2f86cab71a5d3a7a31eccbdfd',
    'callbackURL': '/auth/facebook/callback',
    'redirectUri': 'https://fbmanagement.mjdev.eu'
  }],
  'fb_api_apps': [{
    'appId': '168693576928268',
    'appSecret': '00410c8a498b9ab313f5c2009a45835c',
    'appNamespace': 'fbmanagement_one',
    'redirectUri': 'https://fbmanagement.mjdev.eu'
  }, {
    'appId': '627451074109056',
    'appSecret': 'b6c154fb6b233fc6f46a34b34828ef89',
    'appNamespace': 'fbmanagement_two',
    'redirectUri': 'https://fbmanagement.mjdev.eu'
  }, {
    'appId': '380758775601433',
    'appSecret': '29a16da2f86cab71a5d3a7a31eccbdfd',
    'appNamespace': 'fbmanagement_three',
    'redirectUri': 'https://fbmanagement.mjdev.eu'
  }],
  'jwt_secret': 'the_wild_hunt_#m"pQMA7XW>de6nr',
  'session_secret': 'the_wild_hunt_*@pd62@q4xZLEtUM',
  'mongodb': 'mongodb://localhost:27017/fbmanagement',
  'login_page': 'http://fbmanagement.mjdev.eu:3000/#/login/',
  'login_redirect': 'http://fbmanagement.mjdev.eu:3000/#/doLogin/'
};
