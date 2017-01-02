var express = require('express');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var mongoose = require('mongoose');
var fbApi = require('./fb_api.js');
var fbApiRouter = express.Router();
var db = mongoose.connection;
mongoose.Promise = global.Promise;

db.once('open', () => {
  console.log('Everything good!');
});
//****************************************************
module.exports = function (app, passport, config) {
  //*************** JWT CHECK **************************
  var jwtCheck = expressJWT({
    secret: config.jwt_secret
  });

  //*************** API CONFIG **************************
  app.use('/api/protected', jwtCheck);
  app.use('/api/protected/fbApi', loggedInCheck, fbApiRouter);
  app.use(errorHandler);

  //===============   FB API =================================
  /**
   * GET /api/protected/fbApi/userInfo -> returns logged in user data
   * GET /api/protected/fbApi/pageDetails/:id -> returns all posts and page details for the given page ID
   * GET /api/protected/fbApi/syncPage/:id -> saves data from facebook to the database and returns message if successful, otherwise error
   * GET /api/protected/fbApi/adAccountDetails/:id -> returns campaigns, adsets and ads for the given ad account ID
   * GET /api/protected/fbApi/syncAdAccount/:id -> saves campaigns, adsets and ads data from facebook and returns message if successful, otherwise error
   */

  //========= refresh passport for obtaining facebook access tokens ========
  fbApiRouter.get('/userInfo', function (req, res, next) {
    fbApi.getUserInfo(req.user, function (err, result) {
      if (err) {
        return next(err);
      } else {
        res.json(result);
      }
    });
  });

  fbApiRouter.get('/pageDetails/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id) {
      return next({
        error: 'No page ID found!'
      });
    } else {
      fbApi.getPageDetails(id, function (err, result) {
        if (err) {
          return next(err);
        } else res.json(result);
      })
    }
  });

  fbApiRouter.get('/postDetails/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id) {
      return next({
        error: 'No page ID found!'
      });
    } else {
      fbApi.getPostDetails(id, function (err, result) {
        if (err) {
          return next(err);
        } else res.json(result);
      })
    }
  });

  fbApiRouter.get('/syncPage/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id) {
      return next({
        error: 'No page ID found!'
      });
    } else {
      fbApi.syncPage(id, req.user, function (err, result) {
        if (err) {
          return next(err);
        } else {
          res.json(result);
        }
      })
    }
  });

  fbApiRouter.get('/adAccountDetails/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id) {
      return next({
        error: 'No account ID found!'
      });
    } else {
      fbApi.getAdAccountDetails(id, function (err, result) {
        if (err) {
          return next(err);
        } else res.json(result);
      })
    }
  });

  fbApiRouter.get('/syncAdAccount/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id) {
      return next({
        error: 'No account ID found!'
      });
    } else {
      fbApi.syncAdAccountNow(id, req.user, function (err, result) {
        if (err) {
          return next(err);
        } else res.json(result);
      });
    }
  });
  fbApiRouter.get('/syncAdAccountForDateRange/:id/:from/:until', function (req, res, next) {
    var id = req.params.id;
    var dateRangeFrom = req.params.from;
    var dateRangeTo = req.params.until;
    if (!id) {
      return next({
        error: 'No account ID found!'
      });
    } else if (!dateRangeFrom || !dateRangeTo) {
      return next({
        error: 'Incorrect dateRange parameters!'
      });
    } else {
      var dateRange = [dateRangeFrom, dateRangeTo];
      fbApi.syncAdAccountForDateRange(id, dateRange, req.user, function (err, result) {
        if (err) {
          return next(err);
        } else res.json(result);
      });
    }
  });
  fbApiRouter.get('/syncAdAccountForDateRangeType/:id/:dateRangeType', function (req, res, next) {
    var id = req.params.id;
    var dateRangeType = req.params.dateRangeType;
    if (!id) {
      return next({
        error: 'No account ID found!'
      });
    } else if (!dateRangeType) {
      return next({
        error: 'No date range type found!'
      });
    } else {
      var dateRange = [dateRangeType];
      fbApi.syncAdAccountForDateRange(id, dateRange, req.user, function (err, result) {
        if (err) {
          return next(err);
        } else res.json(result);
      });
    }
  });
  //****************AUTHENTICATION***************************
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['ads_management', 'ads_read', 'manage_pages', 'read_insights']
  }));

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/wrongLogin'
    }),
    function (req, res) {
      loginWithFacebook(req, res);
    }
  );

  app.get('/wrongLogin', function (req, res) {
    res.redirect(config.login_page);
  });

  function loginWithFacebook(req, res) {
    var user = req.user;
    fbApi.initFacebookUser(user, function (err, facebookUser) {
      if (err) {
        res.redirect('/wrongLogin');
      } else {
        var id_token = createToken(user);
        res.redirect(config.login_redirect + id_token);
      }
    });
  }

  function createToken(user) {
    return jwt.sign(_.omit(user, 'password'), config.jwt_secret, {
      expiresInMinutes: 60 * 5
    });
  }

  function loggedInCheck(req, res, next) {
    var loggedInUser = req.user;
    if (!loggedInUser) res.json({
      error: 'No user found for this request'
    });
    next();
  }
};

function errorHandler(err, req, res, next) {
  console.log('======           ERR       ======');
  console.log(err);
  res.status(500).send({
    error: err.err
  })
}
