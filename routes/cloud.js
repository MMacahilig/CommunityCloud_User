var express = require('express');
var router = express.Router();
var Event = require('../models/Event').Event;
var Alert = require('../models/alert').Alert;
var User = require('../models/user').User;
var Contact = require('../models/contact').Contact;
var EventNotification = require('../models/event-notifications').EventNotification;

var restrict = require('../auth/restrict');


/* GET home page. */

router.get('/', restrict, function(req, res, next) {
    //console.log(req.user.created);
    var startDate = new Date(req.user.created);
    var dateString = startDate.getDate() + "/" + startDate.getMonth() + "/" + startDate.getYear();
    //var dateString = startDate.getDate() + "/" + (startDate.getMonth()+1) + "/" + startDate.getYear();
    //console.log(dateString);

    EventNotification.find({UserId: req.user._id}).lean().exec(function(err,docs) {
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
                Alert.find().sort({created: 'desc'}).lean().exec(function(err, alert) {
                    var vm = {
                        firstName : req.user.firstName,
                        lastName : req.user.lastName,
                        address: req.user.address,
                        city: req.user.city,
                        state: req.user.state,
                        id: req.user._id,
                        event: event,
                        alert: alert,
                        created: dateString
                    };
                    res.render('cloud',vm);
                });
            }
        });
    });



        //Alert.find({createdId:req.user._id}).lean().exec(function(err,alert) {
        //    Event.find().lean().exec(function(err, event) {
        //        var vm = {
        //            firstName : req.user.firstName,
        //            lastName : req.user.lastName,
        //            id: req.user._id,
        //            event: event,
        //            alert: alert,
        //            address: req.user.address,
        //            city: req.user.city,
        //            state: req.user.state,
        //            created: dateString
        //        };
        //        res.render('cloud',vm);
        //    });
        //
        //});

});

router.post('/alert', function(req, res, next) {
    //console.log("trigger");
    //console.log("query Body:" + req.body);
    var newAlert = new Alert ({
        alertType: req.body.alertType,
        details: req.body.details,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        rating: req.body.rating,
        createdBy: req.body.createdBy,
        createdId: req.body.createdId,
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

    //res.redirect('/');
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

    console.log("RECEIVED");

    var newEvent = new Event({
        alertType: req.body.alertType,
        details: req.body.details,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        rating: req.body.rating,
        createdBy: req.body.createdBy,
        createdId: req.body.createdId,
        created: Date.now()
    });

    newEvent.save(function (err) {
        if(err){
            console.log(err);

        }
        next(null);
    });

    var eventState = newEvent.state;
    var eventCity = newEvent.city;

    User.find({$or:[ {city:eventCity},{state: eventState}]},function(err,user){
        console.log("searching");
        if(user){
            user.forEach(function(user){
                var newEventNotification = new EventNotification ({
                    UserId: user._id,
                    createdBy: newEvent.createdBy,
                    createdId: newEvent.createdId,
                    eventId: newEvent._id,
                    dismissed: false,
                    created: Date.now()
                });

                newEventNotification.save(function (err) {
                    if(err){
                        console.log(err);
                        //return next(err);
                    }
                    next(null);
                });
            });

        }

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
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
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

    res.send(200);

});

router.delete('/deleteEvents', function(req, res, next) {
    console.log("trigger");
    EventNotification.remove({},function(){console.log("Deleted Notifications");});
    Event.remove({},function(){console.log("Deleted Alerts");});
    res.send(200);
});

router.delete('/deleteAlerts', function(req, res, next) {
    console.log("trigger");
    Alert.remove({},function(){console.log("Deleted Alerts");});
    res.send(200);
});

router.get('/getuserevents', function(req,res,next){

    EventNotification.find({UserId: req.query.id}).lean().exec(function(err,docs) {
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
                res.send(event);
            }
        });
    });

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

router.get('/getuser', function(req,res,next){
    //console.log(req.query);
    var id = req.query._id;
    User.find({_id: id}).lean().exec(function(err,docs){
        res.send(JSON.stringify(docs));
    });
    //res.send(JSON.stringify(req.query));
});

router.get('/getcontacts',function(req,res,next){
    Contact.find({userId: req.user._id}).lean().exec(function(err,docs){
        res.send(docs);
    });
});

router.get('/geteventnotif',function(req,res,next){
    EventNotification.find().lean().exec(function(err,docs){
        res.send(docs);
    });
});

router.post('/pialert', function(req,res,next){
    var newAlert = new Alert({
        alertType: req.body.alertType,
        details: req.body.details,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        rating: req.body.rating,
        createdBy: req.body.createdBy,
        createdId: req.body.createdId,
        created: Date.now()
    });

    newAlert.save(function (err) {
        if(err){
            console.log(err);
            return next(err);
        }
        next(null);
    });

    newAlert.save();
    res.send(JSON.stringify(req.body));
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
