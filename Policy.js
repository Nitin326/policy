const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
    uname:{
        type:String,
        required:true
    },
    fname:{
        type:String,
        required:true
    },
    mname:{
        type:String,
        required:true
    },
    dob:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    policynumber:{
        type:String,
        required:true
    },
    policydate:{
        type:String,
        required:true
    },
    caddress:{
        type:String,
        required:true
    },
    paddress:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    }
})

const Policy = mongoose.model('Policy', PolicySchema);

module.exports = Policy;
