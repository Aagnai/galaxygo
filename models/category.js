const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({

    title: {
        type: String,
        required: [true, 'A category must have a title'],
        unique: true,
    },
    categoryImage: {
        type: String,
        required: true,

    },
    access: {
        type: Boolean,
        default: true,
    }
},
    {
        timestamps: true
    }
);

module.exports = categoryModel = mongoose.model('categoryData', categorySchema);