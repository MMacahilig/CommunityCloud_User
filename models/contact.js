var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var contactSchema = new Schema({
    firstName: { type: String, required: 'Please enter your first name'},
    lastName: { type: String, required: 'Please enter your last name'},
    email: { type: String, required: 'Please enter your email'},
    homePhone: String,
    mobilePhone: String,
    userId: Schema.ObjectId,
    created: {type: Date, Default: Date.now()}
});


var Contact = mongoose.model('Contact', contactSchema);

module.exports = {
    Contact: Contact
};