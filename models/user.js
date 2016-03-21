var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userService = require('../services/user-service');

var userSchema = new Schema({
    firstName: { type: String, required: 'Please enter your first name'},
    lastName: { type: String, required: 'Please enter your last name'},
    email: { type: String, required: 'Please enter your email'},
    password: { type: String, required: 'Please your password '},
    address:  { type: String, required: 'Please your address '},
    city: { type: String, required: 'Please your city '},
    postcode: String,
    state: { type: String, required: 'Please your state '},
    homePhone: String,
    mobilePhone: String,
    currentLocation: String,
    created: {type: Date, Default: Date.now()}
});

userSchema.path('email').validate(function (value, next) {
    userService.findUser(value, function(err, user){
        if(err){
            console.log(err);
            return next(false);
        }
        next(!user);
    });
}, 'That email is already in use');

userSchema.methods.getId = function(){
    return this._id;
};

var User = mongoose.model('User', userSchema);

module.exports = {
    User: User
};
