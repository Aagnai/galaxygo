const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userData'
    },
    items:[{
        product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'productsData'
        },
        quantity:{
         type:Number,
         default:1
        },
        totalPrice:{
            type:Number,
            default:0
        },
        Date:{
            type:Date,
            default:Date.now
        }
    }],
   

    cartTotal:{
        type:Number,
        default:0
    }
})
module.exports = cart = mongoose.model('Shoping-Cart',cartSchema)
