const mongoose = require('mongoose');
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compresion = require('compression');
const homeRoutes = require('./routes/home.js');
const coursesRoutes = require('./routes/courses.js');
const addRoutes = require('./routes/add.js');
const cardRoutes = require('./routes/card.js');
const ordersRoutes = require('./routes/orders.js');
const authRoutes = require('./routes/auth.js');
const profileRoutes = require('./routes/profile.js');
const varMiddleware = require('./middleware/variables.js');
const userMiddleware = require('./middleware/user.js');
const errorHandler = require('./middleware/error.js');
const fileMiddleware = require('./middleware/file.js')
const keyss = require('./kyes');

const { use } = require('./routes/home.js');
const { nextTick } = require('process');
const PORT = process.env.PORT || 3000;
const app = express();
const hbs = exphbs.create({
    defaultLayout:'main',
    extname: 'hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
      },
      helpers: require('./utils/hbshelpers.js')
});


const store = new MongoStore({
    collection: 'sessions',
    uri: keyss.MONGODBB_URI
})
//
app.engine('hbs', hbs.engine);
app.set('veiw engine', 'hbs');
app.set('views', __dirname +  '/views');

//
// app.use(async (req,res,next)=>{
//     try {
//         const user = await User.findById('5f6a2b916404c433083d6f1b'); 
//         req.user = user;
//         next();
//     } catch (err) {
//         console.log(err);
//     }
// })

app.use(express.static(__dirname + '/public'));
app.use('/images',express.static(__dirname + '/images'))
app.use(express.urlencoded({extended: true}));
app.use(session({
   secret: keyss.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}));

app.use(fileMiddleware.single('avatar'));

app.use(csrf());
app.use(flash());
app.use(helmet());
app.use(compresion());
app.use(varMiddleware);
app.use(userMiddleware);


app.use('/' ,homeRoutes);
app.use('/courses' ,coursesRoutes);
app.use('/add' ,addRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

app.use(errorHandler);
//

async function start(){

    try{

        await mongoose.connect(keyss.MONGODBB_URI, {useNewUrlParser:true, 
            useUnifiedTopology: true,
            useFindAndModify: false})
    
        app.listen(PORT, ()=>{
            console.log(`Server is up ${PORT}`)
        })
        // const candidate = await User.findOne();
        // if(!candidate){
        //     const user = new User({
        //         email: 'winchester465@gmail.com',
        //         name: 'Daniel',
        //         cart: {items: []}
        //     })
        //     await user.save();
        // }
    }catch(e){
        console.log(e);
    }
   
}
start()

