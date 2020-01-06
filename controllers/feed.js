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
        return res.status(422).json({message:'Validation Faild', errors: errors.array()})
    }

    const title = req.body.title;
    const content = req.body.content;
    // create post in db
    res.status(201).json({
        message: 'Created!',
        post: {
            _id: new Date().toISOString(),
            title: title,
            content: content,
            imageUrl: 'images/kitkat.jpg',
            creator: {
                name: 'Arash Rabiee',
            },
            createdAt: new Date()
        }
    })
}