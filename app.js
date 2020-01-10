const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const multer = require('multer');

const graphqlHttp = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolver');
const auth = require('./middleware/auth');

const app = express();

// configure file storage
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        const name = Math.random() + '-' + file.originalname;
        cb(null, name);
    }
})

// then we define a filter to look for specific mime types
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true)
    } else {
        cb(null, false)

    }
}

const MONGODB_URI = 'mongodb://localhost:27017/messages?retryWrites=true';

// app.use(bodyParser.urlencoded()); //x-www-form-urlencoded

app.use(bodyParser.json());
// now we register multer
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS'){
        return res.sendStatus(200)
    }
    next();

})

app.use(auth);

app.put('/post-image',(req, res, next)=>{
    if(!req.isAuth){
        const error = new Error('Not Authenticated.');
        error.code = 401;
        throw error
    }
    if(!req.file){
        return res.status(200).json({message:"No file provided!"})
    }
    if(req.body.oldPath){
        clearImage(req.body.oldPath);
    }
    return res.status(201).json({message:"File uploaded!", filePath:req.body.path})
})



// applying the graphql middleware
app.use('/graphql',graphqlHttp({
    schema:graphqlSchema,
    rootValue:graphqlResolver,
    graphiql:true,
    formatError(err){
        if(!err.originalError){
            return err;
        }
        const data = err.originalError.data;
        const message = err.message || 'An error occurred';
        const code = err.originalError.code || 500;
        return {message:message, status: code, data:data}
    } 
}))

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    });
});

mongoose.connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(result => {
         app.listen(8022);
        
    })
    .catch(err => {
        console.log(err)
    });

    const clearImage = filePath => {
        filePath = path.join(__dirname, '..', filePath);
        fs.unlink(filePath, err => console.log(err));
    }
    
    

