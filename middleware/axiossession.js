const axiossession=(req,res,next)=>{

    if(req.session.log){
        next()
    }else{
        console.log("HHHHH");
        res.json("LOGIN")
    }
}


module.exports={axiossession}
