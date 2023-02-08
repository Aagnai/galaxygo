     const userVerifyLogin=(req,res,next)=>{

    if(req.session.log){
        next()
    }else{
        res.redirect("/log")
    }
}


module.exports={userVerifyLogin}
