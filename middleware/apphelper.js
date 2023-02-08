module.exports = {
    userInViews: (req, res, next)=>{
        res.locals.log = req.session.log ? req.log : null;
        return next();
    }
}