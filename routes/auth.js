const {Router} = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const {validationResult} = require('express-validator');
const sendgrid = require('nodemailer-sendgrid-transport');
const Course = require('../models/course.js');
const User = require('../models/user.js')
const bycrypt = require('bcryptjs');
const keys = require('../kyes/index.js');
const resetEmail = require('../emails/reset.js')
const regEmail = require('../emails/registration.js'); 
const {registerValidators, loginValidators} = require('../utils/validators.js')
const router = Router();

const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.node_exp_course_shop},
    logger: true,
    debug: true
}))
router.get('/login', async(req,res)=>{
    res.render('auth/login.hbs', {
        title: 'Authentication',
        isLogin: true,
        rerror: req.flash('rerror'),
        lerror: req.flash('lerror')
    })
})

router.get('/logout', async(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/auth/login#login');
    });
    
 })

router.post('/login', loginValidators,  async(req,res)=>{

    try {
        const errors = validationResult(req);
        const {email, password} = req.body;
        if(!errors.isEmpty()){
            req.flash('lerror', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#login');
        }else{
            res.redirect('/')  
        }

        
        
    } catch (error) {
        console.log(error)
    }
  
})

router.post('/register', registerValidators, async(req,res)=>{
    try {
        const {email,name,password} = req.body;
    
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            req.flash('rerror', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register');
        }
       
            const hashPassword = await bycrypt.hash(password, 10)
            const user = new User({
                email,name,password: hashPassword, cart: {items:[]}
             })
            await user.save();

            
            await transporter.sendMail(regEmail(email));
            res.redirect('/auth/login#login');
        
    } catch (error) {
        console.log(error);
    }
})

router.get('/reset', (req,res)=>{
    res.render('auth/rest.hbs',{
    title:'Reset password',
    error: req.flash('error')
    })
})

router.get('/password/:token', async (req,res)=>{
    if(!req.params.token){
        return res.redirect('auth/login');
    }
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        })
        if(!user){
            return res.redirect('/auth/login');
        }else{
        res.render('auth/password.hbs',{
        title:'New password',
        error: req.flash('error'),
        userId: user._id.toString(),
        token:req.params.token
        })
        }
        
    } catch (error) {
        console.log(error);
    }
    
})

router.post('/password', async (req,res)=>{
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        
        })

        if(user){
            user.password = await bycrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();

            res.redirect('/auth/login');
        }else{
            req.flash('loginError', 'link time die');
            res.redirect('/auth/login');
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/reset', (req,res)=>{
    try {
       crypto.randomBytes(32, async (err, buffer)=>{
        if(err){
            req.flash('error', 'What wrong!');
            return res.redirect('/auth/reset');
        }
        const token = buffer.toString('hex');
        const candidate = await User.findOne({email:req.body.email});
        if(candidate){
            candidate.resetToken = token;
            candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
            await candidate.save();
            await transporter.sendMail(resetEmail(candidate.email, token));
            res.redirect('/auth/login'); 
        }else{
            req.flash('error', 'that email not find!');
            res.redirect('/auth/reset/'); 
        }
       })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;