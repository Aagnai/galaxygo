const users = require('../models/user')
const bcrypt = require('bcrypt');
const otpHelper = require('../util/otp');
// const { render } = require('ejs');
// const { RecordingRulesInstance } = require('twilio/lib/rest/video/v1/room/roomRecordingRule');

let signup;

module.exports = {
  doSignup: (req, res) => {
    if(req.session.log){
      res.redirect('/')
    }else{
      res.render("user/signup", {layout:'layouts/separate.ejs'});
    }
   
  },

  doRegister: async (Data, res, cb) => {
    const phone = Data.mobileNo
    signup = Data
    otpHelper.sendOtp(phone) 
    cb(true)
  },

  otp: async (otp, res, cb) => {
    console.log(otp);

    let { name, email, nPassword, mobileNo } = signup
    await otpHelper.verifyOtp(mobileNo, otp).then(async (verification) => {
      console.log("verification.status xxxxxxxxx",verification.status,"zzzzzzzzzzzzzzzzzzzzz");
      if (verification.status == 'approved') {
        nPassword = await bcrypt.hash(nPassword, 10)
        const userData = new users({
          name: name,
          email: email,
          nPassword: nPassword,
          mobileNo: mobileNo,
        })
        userData.save().then((doc) => {
          cb(doc)
        }).catch((e) => {
          console.log(e);
        })
      } else if (verification.status == 'pending') {
        console.log('otp not matched qwertyuiofdytyTYtytdytytEYTQtuytzytruytzytrytytytywtytyzt');
      }
    }).catch((e)=>{
      console.log("keriyath ivdeeeeee");
    })
  },
  doLogin: (req, res) => {
    let data = req.body;

    return new Promise(async (resolve, reject) => {
      let response = {}
      const user = await users.findOne({ email: data.email })
      if (user && user.access) {
        bcrypt.compare(data.nPassword, user.nPassword).then((status) => {
          if (status) {
            console.log('LOGIN SUCCESS.');
            req.session.log = user
            response.user = user
            response.status = true
            console.log('loged or not :',req.session.log);
            resolve(response)
          }
          else {
            console.log('LOGIN FAILED.');
          
            response.status = false
            // resolve({ status: false })
            resolve(response)

          }
        })
      }
      else {

        console.log('Login Failed.');
        response.status = false
        // resolve({ status: false })
        resolve(response)

      }
      console.log(data)
    })
  }
};
