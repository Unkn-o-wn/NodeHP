const {Router} = require('express');
const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator')
const Course = require('../models/course.js');
const auth = require('../middleware/auth.js');
const {courseValidators} = require('../utils/validators.js')
const router = Router();

function isOwner(course, req) {
    return course.userId.toString() == req.user._id.toString();
}

//
router.get('/', async (req,res)=>{
    try {
        const courses = await Course.find().populate('userId', 'name');
    res.render('courses.hbs', {
        title: 'Courses',
        isCourses: true,
        userId: req.user ? req.user._id.toString() : null,
        courses
    });
    } catch (error) {
       console.log(error); 
    }
});
//
router.get('/:id/edit', auth, async (req,res)=>{
    if(!req.query.allow){
        return res.redirect('/')
    }
    try {
        const course = await Course.findById(req.params.id);
        if (!isOwner(course, req)) {
            return res.redirect('/courses');
            
        }
        res.render('courseedit.hbs', {
            title: `Edit ${course.title}`,
            error: req.flash('error'),
            course
        })
  
    } catch (error) {
        console.log(error);
    }

   
})
//

router.post('/edit', courseValidators, auth, async(req,res)=>{
    try {
        const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash('error', errors.array()[0].msg)
        return res.status(422).redirect(`/courses/${req.body.id}/edit?allow=true`); 
    }
        
        const {id} = req.body;
        delete req.body.id;
        const course = await Course.findById(id);
        if(!isOwner(course, req)){
            return res.redirect('courses');
        }
        Object.assign(course, req.body);
        await course.save();
        res.redirect('/courses');
    } catch (error) {
        console.log(error);
    }
   
    
})
//
router.post('/remove', auth, async (req,res)=>{
     try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        })
        res.redirect('/courses');
         
     } catch (err) {
         console.log(err);
     }

})


//
router.get('/:id', async (req,res)=>{
    try {
        const course = await Course.findById(req.params.id)
    res.render('course.hbs', {
        layout:'empty',
        title: `course ${course.title}`,
        course
    })
        
    } catch (error) {
        console.log(error)
    }
}); 

 


module.exports  = router;