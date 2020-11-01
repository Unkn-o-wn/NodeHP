const {body, validationResult} = require('express-validator');
const User = require('../models/user.js');
const bycrypt = require('bcryptjs');
exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Enter correct email')
        .custom(async (value, {req})=>{
            try {
                user = await User.findOne({email: value});
                if(user){
                    return Promise.reject('This email register')
                }
            } catch (error) {
                console.log(error);
            }
        })
        .normalizeEmail(),
    body('password', 'Password must be min 6 symbol')
        .isLength({min:6, max:24})
        .isAlphanumeric()
        .trim(),
    body('confirm').custom((value, {req})=>{
        if (value !== req.body.password){
            throw new Error('passwords must match')
        }
        return true;
    })
    .trim(),
    body('name', 'Name must be min 3 symbol').isLength({min: 3}).trim()
]
exports.loginValidators = [
    body('email', 'Wrong email')
    .isEmail().withMessage('Wrong email')
    .normalizeEmail(),
    body('password')
    .isLength({min:4, max:24})
    .isAlphanumeric()
    .custom( async(value, {req})=>{
        user = await User.findOne({email: req.body.email});
        try {
            if (!user) {

                return Promise.reject('this user undefiner')
            }else{
                const areSame = await bycrypt.compare(value, user.password);
                if(!areSame){
                    return Promise.reject('wrong password')
                }else{
                    req.session.user = user;
                    req.session.isAuthenticated = true;
                    req.session.save(err=>{
                    if(err){
                        throw err;
                    }else{
    
                }
            })
                }
            }
        } catch (error) {
            console.log(error);
        }
    })
    .trim(),
]
exports.courseValidators = [
    body('title').isLength({min:3, max:25})
    .withMessage('min 3 symbol max 25')
    .trim(),
    body('price')
    .isNumeric()
    .withMessage('Enter correct price'),
    //body('img', 'enter correct url img').isURL()
]