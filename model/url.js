const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    owned : {
        type : String,
        required : true,
    },
    originalUrl : {
        type : String, 
        required : true,
    },
    slug : {
        type : String,
        required : true,
        unique: true
    },
    visits : {
        type : Number,
        default : 0,
    },
});

module.exports = mongoose.model('url', urlSchema);