var express = require('express');
var router = express.Router();
var userService = require('../services/user-service');
var passport = require('passport');
var config = require('../config');
var User = require('../models/user').User;
var EventNotification = require('../models/event-notifications').EventNotification;
var Event = require('../models/Event').Event;
var Alert = require('../models/alert').Alert;


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});



/**
 * GET call to render the details page for user to input personal details
 * Also updates old entry if there is an old record inputted by user
 */
router.get('/details', function (req, res, next) {
  res.render('users/details');
});


/**
 * POST call in registeration page for generating new user for system
 */

router.get('/register', function (req, res, next) {
  res.render('Login/register');
});

router.post('/register', function (req, res, next) {
   console.log(req);
  userService.addUser(req.body, function(err){
    if(err){
      var vm = {
        title: 'Sign up for CommunityCloud',
        input: req.body,
        error: err
      };
      console.log(err);
      delete vm.input.password;
      delete vm.input.confirmPassword;
      return res.render('Login/register', vm);
    }
    req.login(req.body, function(err){
      res.redirect('/cloud');
    });
  });
});

router.get("/userList", function(req, res, next) {
  User.find(function(err, users) {
    res.send(users);
  });
});
/**
 * POST call used for authetication of the user
 */
router.post('/login',
    function(req, res, next){
      console.log(req.body);
      if(req.body.rememberMe){
        req.session.cookie.maxAge = config.cookieMaxAge;
      }

      sess = req.session;
      next();
    },


    passport.authenticate('local', {
      failureRedirect: '/',
      successRedirect: '/cloud',
      failureFlash: 'Invalid credentials'
    }));

router.post('/mobilelogin',
    function(req, res, next){
      //console.log(req.body);

      sess = req.session;
      next();
    },

    passport.authenticate('local', {
      failureRedirect: 'http://communitycloud.herokuapp.com/users/fail',
      successRedirect: 'http://communitycloud.herokuapp.com/users/pass',
      failureFlash: 'Invalid credentials'
    }));

router.get('/mobilelogin', function(req,res,next) {
  res.send(200);

});

router.get('/pass', function(req,res,next){
  console.log("pass: " + req.user._id);
  EventNotification.find({UserId: req.user._id,dismissed:false}).lean().exec(function(err,docs) {
    var alertString = [];
    var queryString = "[";
    var i = 0;

    if(docs){
      for (var key in docs) {
        //console.log("key:" + docs[key].alertId);
        alertString.push(docs[key].eventId);
      }
    }
    //console.log("alerts: " + alertString);
    for (var i = 0; i < alertString.length; i++) {
      if(i == alertString.length -1){
        queryString += "{_id:" + alertString[i]+"}";
      }else{
        queryString += "{_id:" + alertString[i]+"},";
      }
    }
    queryString += "]";
    Event.find({ _id:{$in: alertString }}).sort({created: 'desc'}).lean().exec(function(err,event){
      if(event){
        Alert.find({createdId:req.user._id}).sort({created: 'desc'}).lean().exec(function(err, alert) {
          vm = {
            status: 200,
            id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            address:  req.user.email,
            city: req.user.city,
            postcode: req.user.postcode,
            state: req.user.state,
            homePhone: req.user.homePhone,
            mobilePhone: req.user.mobilePhone,
            created: req.user.created,
            event: event,
            alert: alert

          }
          res.send(vm);
        });
      }
    });
  });


});

router.get('/fail', function(req,res,next){
  vm = {
    status: 401,
  };
  res.send(vm);
});

/**
 * GET call used for loggout and removing session data
 */
router.get('/logout', function(req, res, next){
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
