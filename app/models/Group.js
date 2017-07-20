var mongoose = require('mongoose');

var groupschema = new mongoose.Schema({

    name : {type: String, unique: true},
    admin: {type: String},
    users: Array,
    posts: [{
        username: String,
        message: {type: String},
        time: {type: Number,}
    }]
});

var Group = mongoose.model('groups', groupschema);
module.exports = Group;