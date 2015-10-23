var express = require('express');
var router = express.Router();
var Event = require('../models/Event').Event;
var Alert = require('../models/alert').Alert;
var User = require('../models/user').User;
var Contact = require('../models/contact').Contact;

var restrict = require('../auth/restrict');


/* GET home page. */

router.get('/', restrict, function(req, res, next) {
    //console.log(req.user.created);
    var startDate = new Date(req.user.created);
    var dateString = startDate.getDate() + "/" + startDate.getMonth() + "/" + startDate.getYear();
    //var dateString = startDate.getDate() + "/" + (startDate.getMonth()+1) + "/" + startDate.getYear();
    //console.log(dateString);
    Alert.find().lean().exec(function(err,alert) {
        Event.find().lean().exec(function(err, event) {
            var vm = {
                firstName : req.user.firstName,
                lastName : req.user.lastName,
                id: req.user._id,
                event: event,
                alert: alert,
                address: req.user.address,
                city: req.user.city,
                state: req.user.state,
                created: dateString
            };
            res.render('cloud',vm);
        });

    });

});

router.post('/alert', function(req, res, next) {
    console.log("trigger");
    console.log(req.body);
    var newAlert = new Alert ({
        AlertType: req.body.alertType,
        details: req.body.details,
        location: req.body.location,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        rating: req.body.rating,
        createdBy: req.user._id,
        created: Date.now()
    });

    newAlert.save(function (err) {
        if(err){
            console.log(err);
            return next(err);
        }
        next(null);
    });

    res.sendStatus(200);

    res.redirect('/');
});

router.post('/receiveEvent', function(req,res,next){
    res.setHeader('Access-Control-Allow-Origin', 'http://emergencyservicecloud.herokuapp.com');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);


    var newEvent = new Event({
        alertType: req.body.alertType,
        details: req.body.details,
        location: req.body.location,
        rating: req.body.rating,
        createdBy: req.body.createdBy,
        createdId: req.body.createdId,
        created: Date.now()
    });

    newEvent.save(function (err) {
        if(err){
            console.log(err);
            return next(err);
        }
        next(null);
    });

    res.sendStatus(200);


});

router.get('/addcontact', function(req, res, next) {
    var startDate = new Date(req.user.created);
    var dateString = startDate.getDate() + "/" + startDate.getMonth() + "/" + startDate.getYear();
    var vm = {
        firstName: req.user.firstName,
        lastName : req.user.lastName,
        created: dateString
    };

    res.render('contact',vm);
});

router.post('/addcontact', function(req, res, next) {

    var newContact = new Contact({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        homePhone: req.body.homePhone,
        mobilePhone: req.body.mobilePhone,
        userId: req.user._id,
        created: Date.now()
    });

    newContact.save(function (err) {
        if(err){
            console.log(err);
            return next(err);
        }
        next(null);
    });
    res.redirect('/');
});



router.post('/mobileAlert', function(req, res, next) {
    console.log("trigger");
    console.log(req.body);
    var newAlert = new Alert ({
        AlertType: req.body.AlertType,
        details: req.body.details,
        location: req.body.location,
        rating: req.body.rating,
        createdId: req.body._id,
        createdBy: req.name,
        created: Date.now()
    });

    newAlert.save(function (err) {
        if(err){
            console.log(err);
            return next(err);
        }
        next(null);
    });

    var vm = {
        "success": "true"
    };

    res.send(200);

});

router.delete('/deleteEvents', function(req, res, next) {
    console.log("trigger");
    Event.remove({},function(){console.log("Deleted Alerts");});
});

router.delete('/deleteAlerts', function(req, res, next) {
    console.log("trigger");
    Alert.remove({},function(){console.log("Deleted Alerts");});
});

router.get('/getEvents', function(req,res,next){

   Event.find(function(err, alert) {
        res.setHeader('Content-Type', 'application/json');
        for(var i = 0; i<alert.length;i++) {
            var temp = new Date(alert[i].created);
            alert[i].created = temp.getTime();
        }
        res.send(JSON.stringify(alert));
    });
    /*Event.find(function(err,alert) {
       res.send(alert);
    });*/

});

router.get('/getuser', function(res,req,next){
    var id = req.query._id;
    User.find({userId: req.user._id}).lean().exec(function(err,docs){
        res.send(JSON.stringify(docs));
    });
});

router.get('/getcontacts',function(req,res,next){
    Contact.find({userId: req.user._id}).lean().exec(function(err,docs){
        res.send(docs);
    });
});

router.get('/getAlerts', function(req,res,next){

    Alert.find(function(err, alert) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(alert));
    });
    /*Event.find(function(err,alert) {
     res.send(alert);
     });*/

});



module.exports = router;
