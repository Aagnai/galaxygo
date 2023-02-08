const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  nPassword: {
    type: String,
    required: true
  },
  mobileNo: {
    type: Number,
    required: true
  },
  access: {
    type: Boolean,
    default: true
  },
  delete: {
    type:Boolean,
    default: false
  }
});

module.exports = userModel = mongoose.model("userData", signupSchema);
