const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      stock: {
        type: Number,
        required:true
      },
      category: {
        type: mongoose.Types.ObjectId,
        ref: 'categoryData',
        require: [true, 'Category Needed']
      },
      size: {
        type: String,
        required:true
      },
      productImage: {
        type: Array,
        required: true
      },
      description: {  
        type: String,
        max: 1000
      },
      access: {
        type: Boolean,
        default: true,
    }
      
}, { timestamps: true 
})

module.exports = mongoose.model('productsData',productSchema)