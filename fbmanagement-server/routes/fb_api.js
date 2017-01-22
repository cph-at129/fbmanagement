var FB = require('fb');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
var async = require('async');
var moment = require('moment-timezone');
var config = require('../config/fb_api_config');
var User = require('../models/user.model.js');
var AdAccount = require('../models/ad_account.model.js');
var PageMetrics = require('../models/page_metrics.model.js');
var PostMetrics = require('../models/post_metrics.model.js');
var PostGeneralMetrics = require('../models/post_general_metrics.model.js');
var CampaignInsightMetrics = require('../models/campaign_insight_metrics.model.js');
var AdsetInsightMetrics = require('../models/adset_insight_metrics.model.js');
var AdInsightMetrics = require('../models/ad_insight_metrics.model.js');

//**************** SYNCHRONIZATION TIME CONFIGURATION *****************************

var now = moment();
var SCAN_ID = now.unix();
//********** FB API VERSION *************************************
FB.options({
  version: config.api_version,
  timeout: 20000
});

//**************** FB API ROUTES *********************************
/**
 * the function gets the facebook user information either from the Graph API
 * or from the database if the user has been already saved.
 * ******************
 * the parameters that it takes are the user saved on the request obj and callback
 * ***********************
 * returns as a first parameter the error if any error occurs and
 * the second parameter is facebookUser obj containing all the user info
 */
exports.getUserInfo = function (user, callback) {
    _initFacebookUser(user, function (err, facebookUser) {
      if (err) return callback(err, null);
      facebookUser.adAccountsInfo = [];
      async.each(facebookUser.adAccounts, function (adAccount, callbackAdAccountInfo) {
        _getAdAccountInfo(adAccount, facebookUser, function (err, adAccountInfo) {
          if (err) return callbackAdAccountInfo(err);
          facebookUser.adAccountsInfo.push(adAccountInfo);
          callbackAdAccountInfo();
        });
      }, function (err) {
        if (err) return callback(err, null);
        callback(null, facebookUser);
      });
    });
  }
  /**
   * the function is similar to getUserInfo but it does not return
   * adAccountsInfo on the user obj
   * ****************
   * the parameters that it takes are the user saved on the request obj and callback
   * ******************
   * returns as a first parameter the error if any error occurs and
   * the second parameter is the facebookUser obj
   */
exports.initFacebookUser = function (user, callback) {
  _initFacebookUser(user, function (error, facebookUser) {
    if (error) return callback(error, null);
    callback(null, facebookUser);
  });
}

/**
 * the function will make a synchronization without specifying date ranges
 * and without cheking if any synchronization has been made already
 * *******************
 * the parameters that it takes are the user's business account id,
 * the logged in user saved in the request obj and a callback
 * ********************
 * returns as a first parameter error if any occured and
 * as a second parameter obj containing the results from the synchronization
 */
exports.syncAdAccountNow = function (account_id, user, callback) {
  now = moment();
  SCAN_ID = now.unix();
  var dateRange = null;
  _initFacebookUser(user, function (err, facebookUser) {
    if (err) return callback(err, null);
    _syncAdAccount(account_id, dateRange, facebookUser, function (err, syncResult) {
      if (err) return callback(err, null);
      callback(null, syncResult);
    });
  });
}

/**
 * the function makes a synchronization for specific date range
 * *********
 * the parameters are the business account id, date ranges array,
 * the user obj save on the request obj and a callback function
 * **************
 * returns as a first parameter error if any occured and
 * as a second parameter obj containing the results from the synchronization
 */
exports.syncAdAccountForDateRange = function (account_id, dateRange, user, callback) {
  now = moment();
  SCAN_ID = now.unix();
  _checkIfSynced(account_id, dateRange, function (err, synced, data) {
    if (err) {
      return callback(err, null)
    } else if (synced) {
      console.log('Account {' + account_id + '} already synced!');
      callback(null, data);
    } else {
      _initFacebookUser(user, function (err, facebookUser) {
        if (err) return callback(err, null);
        _syncAdAccount(account_id, dateRange, facebookUser, function (err, syncResult) {
          if (err) return callback(err, null);
          callback(null, syncResult);
        });
      });
    }
  });
}

/**
 * the function gets ad account data saved in the database from past synchronizations
 * **********
 * the parameters are the business account id and a callback function
 * **********
 * returns as a first parameter error if any occured and
 * as a second parameter obj containing the data returned from the database
 */
exports.getAdAccountDetails = function (account_id, callback) {
  _getAdAccountDetails(account_id, function (err, result) {
    if (err) return callback(err, null);
    callback(null, result);
  });
}

/**
 * the function gets page data saved in the database from past synchronizations
 * **********
 * the parameters are the page id and a callback function
 * **********
 * returns as a first parameter error if any occured and
 * as a second parameter obj containing the data returned from the database
 */
exports.getPageDetails = function (page_id, callback) {
  _getPageDetails(page_id, function (err, result) {
    if (err) return callback(err, null);
    callback(null, result);
  });
}

/**
 * the function gets a post data saved in the database from past synchronizations
 * **********
 * the parameters are the post id and a callback function
 * **********
 * returns as a first parameter error if any occured and
 * as a second parameter obj containing the data returned from the database
 */
exports.getPostDetails = function (post_id, callback) {
  _getPostDetails(post_id, function (err, result) {
    if (err) return callback(err, null);
    callback(null, result);
  });
}

/**
 * the function makes a synchronization for specific date range
 * but first checks if there has been synchronization saved in the database
 * for the specified date range, if yes then it returns the database data
 * *********
 * the parameters are the page id, date ranges array,
 * the user obj saved on the request obj and a callback function
 * **************
 * returns as a first parameter error if any occured and
 * as a second parameter obj containing the results from the synchronization
 */
exports.syncPage = function (page_id, dateRange, user, callback) {
  now = moment();
  SCAN_ID = now.unix();
  _checkIfSynced(page_id, dateRange, function (err, synced, data) {
    if (err) return callback(err, null)
    else if (synced) {
      callback(null, data);
    } else {
      _initFacebookUser(user, function (err, facebookUser) {
        if (err) return callback(err, null);
        _syncPage(page_id, facebookUser, function (err, pageMetrics) {
          if (err) return callback(err, null);
          _savePageMetrics(page_id, pageMetrics, function (err, result) {
            if (err) return callback(err, null);
            callback(null, result);
          });
        });
      });
    }
  });
}

//********************** HELPER FUNCTIONS *************************

/**
 * the function checks if ad account has been already synced in the database
 * and if not it will make a synchronization for the account
 * *********
 * the parameters are the ad account obj, the facebook user obj, and a callback function
 * **********
 * returns as a first parameter error if any occured and
 * as a second parameter obj containing the results from the database or the synchronization
 */
function _getAdAccountInfo(adAccount, facebookUser, callback) {
  AdAccount.find({
    'id': adAccount.id
  }, (err, adAccountInfo) => {
    if (err) return callback(err, null);
    var filteredAdAccountInfo = _filterLatestSyncedData(adAccountInfo);
    if (filteredAdAccountInfo.length > 0) {
      callback(null, filteredAdAccountInfo[0]);
    } else {
      _syncAdAccountDetails(adAccount.id, facebookUser, function (err, adAccountDetails) {
        if (err) return callback(err, null);
        callback(null, adAccountDetails);
      });
    }
  });
}


function _syncPage(page_id, facebookUser, callback) {
  var pageMetrics = {};
  _syncPageGeneralMetrics(page_id, facebookUser, function (err, pageGeneralMetrics) {
    if (err) return callback(err, null);
    pageMetrics = pageGeneralMetrics;
    _syncPostsGeneralMetrics(page_id, facebookUser, function (err, postsGeneralMetrics) {
      if (err) return callback(err, null);
      pageMetrics.postsGeneralMetrics = postsGeneralMetrics;
      callback(null, pageMetrics);
    });
  });
}

function _savePageMetrics(page_id, pageMetrics, callback) {
  var post_ids = [];
  async.each(pageMetrics.postsGeneralMetrics, function (postMetrics, callbackPostMetrics) {
    post_ids.push(postMetrics.id);
    var postDbObject = postMetrics;
    postDbObject.scan_id = SCAN_ID + '_' + page_id;
    postDbObject.page_id = page_id;
    var instancePostGeneralMetricsModel = new PostGeneralMetrics(postDbObject);
    instancePostGeneralMetricsModel.save(function (err, result) {
      if (err) return callback(err, null);
      callbackPostMetrics();
    });
  }, function () {
    var pageDbObject = pageMetrics;
    delete pageDbObject.general;
    delete pageDbObject.postsGeneralMetrics;
    for (var key in pageMetrics.general) {
      pageDbObject[key] = pageMetrics.general[key];
    }
    pageDbObject.post_ids = post_ids;
    pageDbObject.scan_id = SCAN_ID + '_' + page_id;
    pageDbObject.id = page_id;
    var instancePageMetricsModel = new PageMetrics(pageDbObject);
    instancePageMetricsModel.save(function (err, result) {
      if (err) return callback(err, null);
      callback(null, {
        info: "Page Metrics Saved Successfully"
      });
    });
  });
}

function _syncPostsMetricsDetails(postsMetrics, facebookUser, callback) {
  var postsMetricsDetails = [];
  var batch = [];
  var parameters = {};
  var postObj = {};
  parameters.access_token = facebookUser.access_token;
  parameters.limit = 100;
  async.eachLimit(postsMetrics, 20, function (post, callbackPostMetricsDetails) {
    batch = [];
    postObj = post;
    batch = _generatePostMetricsInsightsBatch(post.id);
    FB.setAccessToken(parameters.access_token);
    FB.api('', 'post', {
      batch: batch
    }, function (batchResponse) {
      if (!batchResponse || batchResponse.error) return callback(batchResponse.error, null);
      batchResponse.forEach(function (b) {
        var insightObj = JSON.parse(b.body);
        if (insightObj.data) {
          insightObj.data.forEach(function (itemData) {
            var insightObjName = itemData.name;
            postObj[insightObjName] = itemData.values[0].value;
          });
        }
      });
      postsMetricsDetails.push(postObj);
      callbackPostMetricsDetails();
    });
  }, function () {
    callback(null, postsMetricsDetails);
  });
}

function _generatePostMetricsInsightsBatch(post_id) {
  var postsMetricsInsightsBatch = [];
  config.pageMetrics.pagePostsInsights.forEach(function (insight) {
    insight.relative_url = post_id + insight.relative_url;
    postsMetricsInsightsBatch.push(insight);
  });
  return postsMetricsInsightsBatch;
}

function _generatePageInsightsBatch(page_id) {
  var pageInsightsBatch = [];
  config.pageMetrics.pageInsights.forEach(function (insight) {
    insight.relative_url = page_id + insight.relative_url;
    pageInsightsBatch.push(insight);
  });
  return pageInsightsBatch;
}

function _syncPostsGeneralMetrics(page_id, facebookUser, callback) {
  var postsMetrics = [];
  var countData = 0;
  var until = '';
  var parameters = {};
  parameters.access_token = facebookUser.access_token;
  parameters.fields = config.pageMetrics.pagePosts;
  parameters.limit = 100;
  parameters.show_expired = true;
  parameters.include_hidden = true;
  FB.api('/' + page_id + '/posts', parameters, function (result) {
    if (!result || result.error) return callback(result.error, null);
    countData = result.data.length;
    until = querystring.parse(url.parse(result.paging.next).query).until;
    parameters.until = until;
    postsMetrics = result.data;
    async.whilst(
      function () {
        return countData === 100;
      },
      function (callbackPosts) {
        FB.api('/' + page_id + '/posts', parameters, function (result) {
          if (!result || result.error) return callback(result.error, null);
          until = querystring.parse(url.parse(result.paging.next).query).until;
          parameters.until = until;
          countData = result.data.length;
          result.data.forEach(function (post) {
            postsMetrics.push(post);
          });
          callbackPosts();
        });
      },
      function (err) {
        if (err) return callback(err, null);
        callback(null, postsMetrics);
      }
    );
  });
}

function _syncPageGeneralMetrics(page_id, facebookUser, callback) {
  var pageGeneralMetrics = {};
  var parameters = {};
  parameters.access_token = facebookUser.access_token;
  parameters.fields = config.pageMetrics.pageFields;
  parameters.limit = 100;
  FB.api('/' + page_id, parameters, function (result) {
    if (!result || result.error) return callback(result.error, null);
    pageGeneralMetrics.general = result;
    delete parameters.fields;
    parameters.access_token = pageGeneralMetrics.general.access_token;
    parameters.fields = config.pageMetrics.pageRatings;
    FB.api('/' + page_id + '/ratings', parameters, function (result) {
      if (!result || result.error) return callback(result.error, null);
      pageGeneralMetrics.ratings = result.data;
      var batch = _generatePageInsightsBatch(page_id);
      var batch2 = [];
      if (batch.length > 50) {
        for (var i = 50; i < batch.length; i++) {
          batch2.push(batch[i]);
        }
        batch = batch.slice(0, 50);
      }
      FB.setAccessToken(parameters.access_token);
      FB.api('', 'post', {
        batch: batch
      }, function (batchResponse) {
        if (!batchResponse || batchResponse.error) return callback(batchResponse.error, null);
        batchResponse.forEach(function (b) {
          var insightObj = JSON.parse(b.body);
          if (insightObj.data) {
            insightObj.data.forEach(function (itemData) {
              var insightObjName = itemData.name;
              pageGeneralMetrics[insightObjName] = itemData.values[0].value;
            });
          }
        });
        if (batch2.length > 0) {
          FB.api('', 'post', {
            batch: batch2
          }, function (batchResponse2) {
            if (!batchResponse2 || batchResponse2.error) return callback(batchResponse.error, null);
            batchResponse2.forEach(function (b) {
              var insightObj = JSON.parse(b.body);
              if (insightObj.data) {
                insightObj.data.forEach(function (itemData) {
                  var insightObjName = itemData.name;
                  pageGeneralMetrics[insightObjName] = itemData.values[0].value;
                });
              }
            });
            callback(null, pageGeneralMetrics);
          });
        }
      });
    });
  });
}

/**
 * the function gets page data saved in the database from past synchronizations
 * **********
 * the parameters are the page id and a callback function
 * **********
 * returns as a first parameter error if any occured and
 * as a second parameter obj containing the data returned from the database
 */
function _getPageDetails(id, callback) {
  PageMetrics.find({
    'id': id
  }, (err, pages) => {
    if (err) return callback(err, null);
    var filteredPage = _filterLatestSyncedData(pages);
    callback(null, filteredPage);
  });
}

/**
 * the function gets a post data saved in the database from past synchronizations
 * **********
 * the parameters are the post id and a callback function
 * **********
 * returns as a first parameter error if any occured and
 * as a second parameter obj containing the data returned from the database
 */
function _getPostDetails(id, callback) {
  PostGeneralMetrics.find({
    'id': id
  }, (err, posts) => {
    if (err) return callback(err, null);
    var filteredPost = _filterLatestSyncedData(posts);
    callback(null, filteredPost);
  });
}

function _syncAdAccountDetails(account_id, facebookUser, callback) {
  var parameters = {};
  parameters.access_token = facebookUser.access_token;
  parameters.fields = config.adAccount.fields;
  FB.api('/' + account_id, parameters, function (adAccountDetails) {
    if (!adAccountDetails || adAccountDetails.error) return callback(adAccountDetails.error, null);
    AdAccount.find({
      'id': account_id
    }, (err, adAccounts) => {
      if (err) return callback(err, null);
      else if (adAccounts.length > 0) {
        var latestSyncedAdAccount = _filterLatestSyncedData(adAccounts);
        return callback(null, latestSyncedAdAccount[0]);
      } else {
        adAccountDetails.scan_id = SCAN_ID + '_' + account_id;
        var instanceAdAccountModel = new AdAccount(adAccountDetails);
        instanceAdAccountModel.save(function (err, result) {
          if (err) return callback(err);
          callback(null, adAccountDetails);
        });
      }
    });
  });
}

function _syncCampaigns(account_id, dateRange, facebookUser, callback) {
  var parameters = {};
  var campaignInsights = [];
  parameters.access_token = facebookUser.access_token;
  FB.api('/' + account_id + '/campaigns', parameters, function (campaigns) {
    if (!campaigns || campaigns.error) return callback(campaigns.error);
    async.each(campaigns.data, function (campaign, callbackCampaigns) {
      _getInsights(facebookUser, dateRange, campaign.id, 'campaign', function (err, insights) {
        if (err) return callbackCampaigns(err);
        var campaignDbObject = insights.generalInsights;
        for (var key in insights.detailsInsights) {
          campaignDbObject[key] = insights.detailsInsights[key];
        }
        campaignDbObject.scan_id = SCAN_ID + '_' + account_id;
        campaignDbObject.currency = facebookUser.currency.currency;
        campaignInsights.push(campaignDbObject);
        var instanceCampaignInsightsModel = new CampaignInsightMetrics(campaignDbObject);
        instanceCampaignInsightsModel.save(function (err, result) {
          if (err) return callbackCampaigns(err);
          callbackCampaigns();
        });
      });
    }, function (err) {
      if (err) return callback(err);
      callback(null, campaignInsights);
    });
  });
}

function _syncAdsets(account_id, dateRange, facebookUser, callback) {
  var parameters = {};
  var adsetInsights = [];
  parameters.access_token = facebookUser.access_token;
  FB.api('/' + account_id + '/adsets', parameters, function (adsets) {
    if (!adsets || adsets.error) return callback(adsets.error);
    async.each(adsets.data, function (adset, callbackAdsets) {
      _getInsights(facebookUser, dateRange, adset.id, 'adset', function (err, insights) {
        if (err) return callbackAdsets(err);
        var adsetDbObject = insights.generalInsights;
        for (var key in insights.detailsInsights) {
          adsetDbObject[key] = insights.detailsInsights[key];
        }
        adsetDbObject.scan_id = SCAN_ID + '_' + account_id;
        adsetDbObject.currency = facebookUser.currency.currency;
        adsetInsights.push(adsetDbObject);
        var instanceAdsetInsightsModel = new AdsetInsightMetrics(adsetDbObject);
        instanceAdsetInsightsModel.save(function (err, result) {
          if (err) return callbackAdsets(err);
          callbackAdsets();
        });
      });
    }, function (err) {
      if (err) return callback(err);
      callback(null, adsetInsights);
    });
  });
}

function _syncAds(account_id, dateRange, facebookUser, callback) {
  var parameters = {};
  var adInsights = [];
  parameters.access_token = facebookUser.access_token;
  FB.api('/' + account_id + '/ads', parameters, function (ads) {
    if (!ads || ads.error) return callback(ads.error);
    async.each(ads.data, function (ad, callbackAds) {
      _getInsights(facebookUser, dateRange, ad.id, 'ad', function (err, insights) {
        if (err) return callbackAds(err);
        var adDbObject = insights.generalInsights;
        for (var key in insights.detailsInsights) {
          adDbObject[key] = insights.detailsInsights[key];
        }
        adDbObject.scan_id = SCAN_ID + '_' + account_id;
        adDbObject.currency = facebookUser.currency.currency;
        adDbObject.ad_creatives = insights.ad_creatives;
        adInsights.push(adDbObject);
        var instanceAdInsightsModel = new AdInsightMetrics(adDbObject);
        instanceAdInsightsModel.save(function (err, result) {
          if (err) return callbackAds(err);
          callbackAds();
        });
      });
    }, function (err) {
      if (err) return callback(err);
      callback(null, adInsights);
    });
  });
}

function _syncAdAccount(account_id, dateRange, facebookUser, callback) {
  var insightMetrics = {};
  var parameters = {};
  var syncResult = {};
  parameters.access_token = facebookUser.access_token;
  _syncAdAccountDetails(account_id, facebookUser, function (err) {
    if (err) return callback(err);
    _syncCampaigns(account_id, dateRange, facebookUser, function (err, campaigns) {
      if (err) return callback(err);
      syncResult.campaigns = campaigns;
      _syncAdsets(account_id, dateRange, facebookUser, function (err, adsets) {
        if (err) return callback(err);
        syncResult.adsets = adsets;
        _syncAds(account_id, dateRange, facebookUser, function (err, ads) {
          if (err) return callback(err);
          syncResult.ads = ads;
          callback(null, syncResult);
        });
      });
    });
  });
}

function _getAdAccountDetailsForDateRange(id, dateRange, callback) {
  var account_id = id.split('_')[1]; //act_10101010101
  var result = {
    campaigns: [],
    adsets: [],
    ads: []
  };
  if (dateRange.length === 1) {
    var dateRangeType = dateRange[0];
    callback(null, result);
  } else if (dateRange.length === 2) {
    var dateRangeFrom = dateRange[0];
    var dateRangeTo = dateRange[1];
    CampaignInsightMetrics.find({
      'account_id': account_id,
      'date_start': dateRangeFrom,
      'date_stop': dateRangeTo
    }, (err, campaigns) => {
      if (err) return callback(err, null);
      if (campaigns.length === 0) return callback(err, result);
      result.campaigns = _checkIfItemEmpty(campaigns);
      AdsetInsightMetrics.find({
        'account_id': account_id,
        'date_start': dateRangeFrom,
        'date_stop': dateRangeTo
      }, (err, adsets) => {
        if (err) return callback(err, null);
        if (adsets.length === 0) return callback(err, result);
        result.adsets = _checkIfItemEmpty(adsets);
        AdInsightMetrics.find({
          'account_id': account_id,
          'date_start': dateRangeFrom,
          'date_stop': dateRangeTo
        }, (err, ads) => {
          if (err) return callback(err, null);
          if (adsets.length === 0) return callback(err, result);
          result.ads = _checkIfItemEmpty(ads);
          callback(null, result);
        });
      });
    })
  }
}

function _getAdAccountDetails(id, callback) {
  var account_id = id.split('_')[1]; //act_10101010101
  var result = {
    campaigns: [],
    adsets: [],
    ads: []
  };
  CampaignInsightMetrics.find({
    'account_id': account_id
  }, (err, campaigns) => {
    if (err) return callback(err, null);
    var checkedCampaignsArr = _checkIfItemEmpty(campaigns);
    var latestSyncedCampaigns = _filterLatestSyncedData(checkedCampaignsArr);
    result.campaigns = latestSyncedCampaigns;
    AdsetInsightMetrics.find({
      'account_id': account_id
    }, (err, adsets) => {
      if (err) return callback(err, null);
      var checkedAdsetsArr = _checkIfItemEmpty(adsets);
      var latestSyncedAdsets = _filterLatestSyncedData(checkedAdsetsArr);
      result.adsets = latestSyncedAdsets;
      AdInsightMetrics.find({
        'account_id': account_id
      }, (err, ads) => {
        if (err) return callback(err, null);
        var checkedAdsArr = _checkIfItemEmpty(ads);
        var latestSyncedAds = _filterLatestSyncedData(checkedAdsArr);
        result.ads = latestSyncedAds;
        callback(null, result);
      });
    });
  });
}
/**
 * checks if an item contains metrics data by
 * if the field 'date_start' is not empty which indicates that
 * the item contains data
 *
 * returns only array of the items that contain data
 */
function _checkIfItemEmpty(data) {
  var checkedItemsArr = [];
  data.forEach(function (item) {
    if (item.date_start) {
      checkedItemsArr.push(item);
    }
  });
  return checkedItemsArr;
}

/**
 * Checks if the ad account has been synced
 */
function _checkIfSynced(id, dateRange, callback) {
  var synced = false;
  if (dateRange) {
    _getAdAccountDetailsForDateRange(id, dateRange, function (err, result) {
      if (err) return callback(err, null);
      else if (result.campaigns.length > 0 && result.campaigns.length > 0 && result.campaigns.length > 0) {
        synced = true;
        callback(null, synced, result);
      } else {
        synced = false;
        callback(null, synced, null);
      }
    });
  } else {
    _getAdAccountDetails(id, function (err, result) {
      if (err) return callback(err, null);
      else if (result.campaigns.length > 0) {
        try {
          var unix_id = result.campaigns[0].scan_id.split('_')[0];
          var lastSynced = new Date(unix_id * 1000);
          var dateNow = new Date(now);
          if (lastSynced.setHours(0, 0, 0, 0) === dateNow.setHours(0, 0, 0, 0)) {
            // Date equals today's date
            console.log(`${id} already synced today`);
            synced = true;
            callback(null, synced, result);
          } else {
            console.log(`${id} has not been synced today yet`);
            synced = false;
            callback(null, synced, null);
          }
        } catch (err) {
          return callback(err, null);
        }
      } else {
        synced = false;
        callback(null, synced);
      }
    });
  }
}

function _getInsights(facebookUser, dateRange, id, nodeType, callback) {
  var insights = {};
  var parametersGeneralInsights = {};
  var parametersDetailsInsights = {};
  var parametersAdCreatives = {};
  if (!dateRange) {
    console.log('No date range specified!!!');
  } else {
    if (dateRange.length === 1) {
      parametersDetailsInsights.date_preset = dateRange[0];
    } else if (dateRange.length === 2) {
      var dateRangeFrom = moment(new Date(dateRange[0])).format('YYYY-MM-DD');
      var dateRangeTo = moment(new Date(dateRange[1])).format('YYYY-MM-DD');
      parametersDetailsInsights.time_range = {
        since: dateRangeFrom,
        until: dateRangeTo
      };
    }
  }
  parametersDetailsInsights.limit = 100;
  parametersDetailsInsights.access_token = facebookUser.access_token;
  parametersGeneralInsights.access_token = facebookUser.access_token;
  parametersAdCreatives.access_token = facebookUser.access_token;

  if (nodeType === 'campaign') {
    parametersGeneralInsights.fields = config.insightMetrics.campaignFields;
    parametersDetailsInsights.fields = config.insightMetrics.insightsCampaignFields;
  } else if (nodeType === 'adset') {
    parametersGeneralInsights.fields = config.insightMetrics.adsetFields;
    parametersDetailsInsights.fields = config.insightMetrics.insightsAdsetFields;
  } else if (nodeType === 'ad') {
    parametersGeneralInsights.fields = config.insightMetrics.adFields;
    parametersDetailsInsights.fields = config.insightMetrics.insightsAdFields;
    parametersAdCreatives.fields = config.insightMetrics.adFieldsAdCreatives;
  }
  FB.api('/' + id, parametersGeneralInsights, function (generalInsights) {
    if (!generalInsights || generalInsights.error) return callback(generalInsights.error, null);
    insights.generalInsights = generalInsights;
    if (nodeType === 'ad') {
      FB.api('/' + id + '/insights', parametersDetailsInsights, function (detailsInsights) {
        if (!detailsInsights || detailsInsights.error) return callback(detailsInsights.error, null);
        insights.detailsInsights = detailsInsights.data[0];
        FB.api('/' + id + '/adcreatives', parametersAdCreatives, function (adCreatives) {
          if (!adCreatives || adCreatives.error) return callback(adCreatives.error, null);
          insights.ad_creatives = adCreatives.data[0];
          callback(null, insights);
        });
      });
    } else {
      FB.api('/' + id + '/insights', parametersDetailsInsights, function (detailsInsights) {
        if (!detailsInsights || detailsInsights.error) return callback(detailsInsights.error, null);
        insights.detailsInsights = detailsInsights.data[0];
        callback(null, insights);
      });
    }
  });
}

function _initFacebookUser(user, callback) {
  var facebookUser = {};
  var parameters = {};
  facebookUser.name = user.facebook.name;
  facebookUser.access_token = user.facebook.token;
  facebookUser.refreshToken = user.facebook.refreshToken;
  facebookUser.clientID = user.facebook.clientID;
  facebookUser.clientSecret = user.facebook.clientSecret;
  facebookUser.callbackURL = user.facebook.callbackURL;
  facebookUser.id = user.facebook.id;
  parameters.access_token = facebookUser.access_token;
  User.findOne({
    'facebook.id': facebookUser.id
  }, (err, dbUser) => {
    if (err) return callback(err, null);
    if (dbUser.facebook.adAccounts && dbUser.facebook.pages) {
      if (dbUser.facebook.adAccounts.length > 0 && dbUser.facebook.pages.length > 0) {
        facebookUser.currency = dbUser.facebook.currency;
        facebookUser.adAccounts = dbUser.facebook.adAccounts;
        facebookUser.pages = dbUser.facebook.pages;
        callback(null, facebookUser);
      } else {
        FB.api('/' + facebookUser.id + '/accounts', parameters, function (accounts) {
          if (!accounts || accounts.error) return callback(accounts.error, null);
          facebookUser.pages = accounts.data;
          FB.api('/' + facebookUser.id + '/?fields=currency', parameters, function (currency) {
            facebookUser.currency = currency;
            FB.api('/' + facebookUser.id + '/adaccounts?fields=user_currency', parameters, function (adaccounts) {
              if (!adaccounts || adaccounts.error) return callback(adaccounts.error, null);
              facebookUser.adAccounts = adaccounts.data;
              User.update({
                  'facebook.id': facebookUser.id
                }, {
                  'facebook.currency': facebookUser.currency.currency
                },
                function (err) {
                  if (err) return callback(err, null);
                  User.update({
                      'facebook.id': facebookUser.id
                    }, {
                      'facebook.adAccounts': facebookUser.adAccounts
                    },
                    function (err) {
                      if (err) return callback(err, null);
                      User.update({
                          'facebook.id': facebookUser.id
                        }, {
                          'facebook.pages': facebookUser.pages
                        },
                        function (err) {
                          if (err) return callback(err, null);
                          callback(null, facebookUser);
                        }
                      );
                    }
                  );
                }
              );
            });
          });
        });
      }
    }
  });
}

function _filterLatestSyncedData(data, callback) {
  var filteredData = [];
  var scan_unix_ids = [];
  var latest_unix_id = 0;
  data.forEach(function (item) {
    var unix_id = item.scan_id.split('_')[0];
    scan_unix_ids.push(unix_id);
  });
  scan_unix_ids.forEach(function (unix_id) {
    var idToInt = parseInt(unix_id);
    if (idToInt > latest_unix_id) latest_unix_id = idToInt;
  });
  data.forEach(function (item) {
    var unix_id = parseInt(item.scan_id.split('_')[0]);
    if (unix_id === latest_unix_id) filteredData.push(item);
  });
  return filteredData;
}


// exports.syncAdAccount = function (account_id, user, callback) {
//   now = moment();
//   SCAN_ID = now.unix();
//   var dateRange = null;
//   _checkIfSynced(account_id, dateRange, function (err, synced, data) {
//     if (err) {
//       return callback(err, null)
//     } else if (synced) {
//       callback(null, data);
//     } else {
//       _initFacebookUser(user, function (err, facebookUser) {
//         if (err) return callback(err, null);
//         _syncAdAccount(account_id, dateRange, facebookUser, function (err, syncResult) {
//           if (err) return callback(err, null);
//           callback(null, syncResult);
//         });
//       });
//     }
//   });
// }

// exports.syncPageNow = function (page_id, user, callback) {
//   now = moment();
//   SCAN_ID = now.unix();
//   _initFacebookUser(user, function (err, facebookUser) {
//     if (err) return callback(err, null);
//     _syncPage(page_id, facebookUser, function (err, pageMetrics) {
//       if (err) return callback(err, null);
//       _savePageMetrics(page_id, pageMetrics, function (err, result) {
//         if (err) return callback(err, null);
//         callback(null, result);
//       });
//     });
//   });
// }
