const express=require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
var useragent = require('express-useragent');
const admin = require('./routes/admin/admin');
const employer = require('./routes/employer/employer');
const user = require('./routes/user/user'); // Importing the user routes
 // Importing the employer routes
 const dotenv = require('dotenv');
dotenv.config();



let app = express();//BODYPARSER
app.use(bodyParser.urlencoded({
    extended: true, limit: '150mb'
}));
app.use(bodyParser.json({ limit: '150mb' }));

app.use("/uploads", express.static('uploads'));
//PORT DECLARATION
var port = process.env.PORT || 4000;//CORS SETUP 
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

mongoose.connect(process.env.MONGO_URI,
).then(() => { 
    console.log('DATABASE CONNECTED SUCCESSFULLY');
}).catch((err) => {
    console.log('Error connecting to database');
    console.log(err);
});


//SECURITY SETUP
app.use(cors());
app.use(helmet({crossOriginResourcePolicy:false}));//CONSOLES THE USER INFORMATION AND API CALLS INTO THE SERVER ENVIRONMENT
app.use(useragent.express());
app.use((req, res, next) => {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    console.log(fullUrl)
    next();
})

app.use(admin)
app.use(employer)
app.use(user); // Using the user routes

const server = app.listen(port, '0.0.0.0', function () {
    console.log("SERVER RUNNING ON PORT:" + port);
});