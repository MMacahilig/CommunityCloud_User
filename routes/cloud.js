var express = require('express');
var router = express.Router();
var Event = require('../models/event').Event;
var Alert = require('../models/alert').Alert;
var User = require('../models/user').User;

var restrict = require('../auth/restrict');


/* GET home page. */

router.get('/', restrict, function(req, res, next) {
    //console.log(req.user.created);
    var startDate = new Date(req.user.created);
    var dateString = startDate.getDate() + "/" + startDate.getMonth() + "/" + startDate.getYear();
    //var dateString = startDate.getDate() + "/" + (startDate.getMonth()+1) + "/" + startDate.getYear();
    //console.log(dateString);
    Event.find().lean().exec(function(err, alert) {
        var vm = {
            firstName : req.user.firstName,
            lastName : req.user.lastName,
            alert: alert,
            created: dateString
        };
        res.render('cloud',vm);
    });

});

router.post('/alert', function(req, res, next) {
    console.log("trigger");
    console.log(req.body);
    var newAlert = new Alert ({
        AlertType: req.body.alertType,
        details: req.body.details,
        location: req.body.location,
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
    var newEvent = new Event({
        alertType: req.body.AlertType,
        details: req.body.details,
        location: req.body.location,
        rating: req.body.rating,
        createdBy: req.body.createdBy,
        createdId: req.body.createdId,
        created: Date.now()
    });


});

router.post('/mobileAlert', function(req, res, next) {
    console.log("trigger");
    console.log(req.body);
    var newAlert = new Alert ({
        AlertType: req.body.AlertType,
        details: req.body.details,
        location: req.body.location,
        rating: req.body.rating,
        createdBy: req.body._id,
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

router.delete('/deleteAlerts', function(req, res, next) {
    console.log("trigger");
    Alert.remove({},function(){console.log("Deleted Alerts");});
});

router.get('/getAlerts', function(req,res,next){
    Event.find(function(err, alert) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(alert));
    });
});



module.exports = router;
