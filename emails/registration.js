const keys = require('../kyes/index.js');

module.exports = function(email){
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject:'Acount create',
        html:`
        <h1>Welcome in our shop</h1>
        <p>You acses create acount email - ${email}</p>
        </hr>
        <a href="${keys.BASE_URL}" target=_blank>web site</a>
        `
    }
}