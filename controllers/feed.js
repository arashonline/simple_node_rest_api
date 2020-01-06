const { validationResult }= require('express-validator/check');

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{
            _id: '1',
            title: 'test',
            content: 'some content',
            imageUrl: 'images/kitkat.jpg',
            creator: {
                name: 'Arash Rabiee',
            },
            createdAt: new Date()
        }]
    });
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation Faild');
        error.statusCode = 422;
        throw error;
        // return res.status(422).json({message:'Validation Faild', errors: errors.array()})
    }

    const title = req.body.title;
    const content = req.body.content;
    // create post in db
    const post = new post({
            title: title,
        content: content,
        imageUrl: 'images/kitkat.jpg',
            creator: {
                name: 'Arash Rabiee',
            },
            createdAt: new Date()}
    );
    post
    .save()
    .then(result=>{
        res.status(201).json({
            message: "Post created!",
            post: result
        })
    })
    .catch(err =>{
        if(!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    })
   
}