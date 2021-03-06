var express = require('express');
var router = express.Router();
var Event = require('../models/Event').Event;
var Alert = require('../models/alert').Alert;
var User = require('../models/user').User;
var Contact = require('../models/contact').Contact;
var EventNotification = require('../models/event-notifications').EventNotification;

var restrict = require('../auth/restrict');


/*****
 * HTTP GET '/'
 *
 * This route renders the user dashboard and grabs the user specific alerts and events
 * This route provides the user information displayed on the secondary window
 *
 */

router.get('/', restrict, function(req, res, next) {
    var startDate = new Date(req.user.created);
    var dateString = startDate.getDate() + "/" + startDate.getMonth() + "/" + startDate.getYear();

    EventNotification.find({UserId: req.user._id,dismissed:false}).lean().exec(function(err,docs) {
        var alertString = [];
        var queryString = "[";
        var i = 0;

        if(docs){
            for (var key in docs) {
                alertString.push(docs[key].eventId);
            }
        }
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

        User.findOneAndUpdate({_id:req.user._id},{currentLocation:""},function(err,docs){
            console.log(err);
        });

    });

});

/**
 *
 * HTTP PUT '/dismissevent'
 *
 * This PUT request retrieves the user's selected event notification and changes the dismissed attribute to TRUE
 *
 */
router.put('/dismissevent', function(req,res,next){
    EventNotification.findOneAndUpdate({UserId:req.body.id},{dismissed:true},function(err,docs){
        console.log(err);
    });
    res.send(200);
});

/**
 *
 * HTTP PUT '/dismissallevent'
 *
 * This HTTP PUT finds all the user event notifications and changes the dismiss attribute to TRUE
 *
 * */
router.put('/dismissallevent', function(req,res,next){


    EventNotification.find({UserId:req.body.id},function(err,docs){
        docs.forEach(function(doc){
            doc.dismissed = true;
            doc.save();
        });
    });

    res.send(200);
});


/**
 *
 * HTTP POST '/alert'
 *
 * When the user sends an alert message, this post route generates a record of the alert and stores it in the
 * client database
 *
 * */
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

    //res.send("OK");

    //res.redirect('/');
});

/**
 * This post will save a receivt event message
 */

router.post('/receiveEvent', function(req,res,next){



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
        //next(null);
    });

    var eventState = newEvent.state;
    var eventCity = newEvent.city;


    if(eventCity == ""){
        //new RegExp('^'+req.query.eventState, "i")
        //User.find({state: eventState},function(err,user){
        User.find({state: new RegExp('^'+eventState, "i")},function(err,user){
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
                        //next(null);
                    });
                });

            }

        });
    }else{
        //User.find({city:eventCity,state: eventState},function(err,user){
        //User.find({city:new RegExp('^'+eventCity, "i"),state: new RegExp('^'+eventState, "i")},function(err,user){
        User.find({$or: [{city:new RegExp('^'+eventCity, "i")}, {currentLocation:new RegExp('^'+eventCity, "i")}],state: new RegExp('^'+eventState, "i")},function(err,user){
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
                        //next(null);
                    });
                });

            }

        });
    }
    //res.send("OK");
    //res.end

});

/**
 * generates the contact form
 */
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

/**
 * generates a contact record and stores it onto the database
 */
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

/**
 * This stores the alert received from the mobile
 */

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
            //return next(err);
        }
        next(null);
    });

    res.send(200);

});

/**
 * this deletes all events in database
 */
router.delete('/deleteEvents', function(req, res, next) {

    EventNotification.remove({},function(){console.log("Deleted Notifications");});
    Event.remove({},function(){console.log("Deleted Alerts");});
    res.send(200);
});

/**
 * this deletes all alerts in the database
 */
router.delete('/deleteAlerts', function(req, res, next) {
    console.log("id: " + req.body.id);
    Alert.remove({createdId:req.body.id},function(){console.log("Deleted Alerts");});
    res.send(200);
});

/**
 * raspberry Refresh()
 */
router.get('/getuserevents', function(req,res,next){

    EventNotification.find({UserId: req.query.id,dismissed: false}).lean().exec(function(err,docs) {
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

/**
 * saves an alert sent from the raspberry pi
 */
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

/**
 * updates user location
 */
router.put('/setlocation', function(req,res,next){
    var id = req.body.id;

    User.findOneAndUpdate({_id:id},{currentLocation:req.body.city},function(err,docs){
        console.log(err);
    });

    res.send(200);
});

/**
 * refreshAndroid()
 */
router.get('/refreshmobile',function(req,res,next){
    console.log(req.query);
    EventNotification.find({UserId: req.query.id,dismissed:false}).lean().exec(function(err,docs) {
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
                Alert.find({createdId:req.query.id}).sort({created: 'desc'}).lean().exec(function(err, alert) {
                    vm = {
                        event: event,
                        alert: alert

                    }
                    res.send(vm);
                });
            }
        });
    });


});

router.get('/getAlerts', function(req,res,next){

    Alert.find(function(err, alert) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(alert));
    });


});





module.exports = router;
