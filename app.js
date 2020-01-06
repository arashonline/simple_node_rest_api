const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const feedRoutes = require('./routes/feed');

const app = express();

const MONGODB_URI = 'mongodb://localhost:27017/messages';

// app.use(bodyParser.urlencoded()); //x-www-form-urlencoded

app.use(bodyParser.json()); 

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();

})

app.use('/feed', feedRoutes);

mongoose.connect(MONGODB_URI,{ useUnifiedTopology: true,useNewUrlParser: true })
.then(result =>{
    app.listen(8022);
})
.catch(err=>{
    console.log(err)
})

