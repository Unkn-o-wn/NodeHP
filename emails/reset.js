const keys = require('../kyes/index.js');

module.exports = function(email, token){
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject:'Reset password',
        html:`
        <h1>Are you forget password?</h1>
        <p>if no ignore this mmassage</p>
        </hr>
        <p>else click this link</p>
        <p> <a href="${keys.BASE_URL}auth/password/${token}" target=_blank>reset password</a></p>
        <a href="${keys.BASE_URL}" target=_blank>web site</a>
        `
    }


}