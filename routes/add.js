const {Router} = require('express');
const {validationResult} = require('express-validator');
const Course = require('../models/course.js');
const auth = require('../middleware/auth.js');
const router = Router();
const {courseValidators} = require('../utils/validators.js');




router.get('/', auth, (req,res)=>{
    res.render('add.hbs', {
        title: 'Add course',
        isAdd: true
    });
})

router.post('/authorization', auth, courseValidators,  
 async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('add.hbs', {
            title: 'Add course',
            isAdd: true,
            error: errors.array()[0].msg,
            data:  {
                title: req.body.title,
               price: req.body.price,
                img: req.body.img
            }
        }); 
    }

   // const course = new Course(req.body.title, req.body.price, req.body.img);
   const course = new Course({
       title: req.body.title,
       price: req.body.price,
       img: req.body.img,
       userId: req.user._id
   });
   try{
    await course.save();
    res.redirect('/courses');

   }catch(e){
       console.log(e)
   }
   
}
)
module.exports = router;