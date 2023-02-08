const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userData'
    },
    items:[{
        product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'productsData'
        },
        Date:{
            type:Date,
            default:Date.now
        }
    }],
})
module.exports = mongoose.model('wishlist',wishlistSchema)
