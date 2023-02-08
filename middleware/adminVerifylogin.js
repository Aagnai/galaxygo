const adminVerifyLogin=(req,res,next)=>{

    if(req.session.adminLog){
   next();
    }else{
        res.redirect("/admin/");
    }
}
module.exports={adminVerifyLogin}