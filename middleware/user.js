const session = require('express-session');
const User = require('../models/user.js');

module.exports = async function (req,res,next) {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js")
    if (!req.session.user) {
        return next();
    }else{
        req.user = await User.findById(req.session.user._id);
        next();
    }
    
}