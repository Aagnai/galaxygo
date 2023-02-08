const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema ({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userData"
    },
    address:[{
        fName:{
            type : String,
            required : true
        },
        pincode:{
            type: Number,
            required : true
        },
        addressLine:{
            type : String,
            required : true
        },
        city:{
            type : String,
            required : true
        },
        state:{
            type : String,
            required : true
        },
        country:{
            type : String,
            required : true
        },
        landmark:{
            type : String
        },
        phone:{
            type : Number,
            
        }

    }]

})

module.exports = address = mongoose.model("Address",addressSchema)
