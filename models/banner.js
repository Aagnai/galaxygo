const mongoose = require("mongoose")

const BannerSchema = new mongoose.Schema({

    head1: {
        type : String,
        required : true
    },
    head2: {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    imageUrl :{
        type : String,
        required : true
    },
    route:{
        type: String
    },
    delete: {
        type:Boolean,
          default: false
    },
    
},{
    timestamps:true  
   })

const Banner = mongoose.model("Banner",BannerSchema)

module.exports= Banner