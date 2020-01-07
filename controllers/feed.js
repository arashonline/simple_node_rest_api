const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    
    Post.find()
        .then(posts => {
            res.status(200).json({
                message: 'Fetched posts successfully.',
                posts: posts
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Faild');
        error.statusCode = 422;
        throw error;
        // return res.status(422).json({message:'Validation Faild', errors: errors.array()})
    }

    if(!req.file){
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;

    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    // create post in db
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: {
            name: 'Arash Rabiee',
        },
        createdAt: new Date()
    }
    );
    post
        .save()
        .then(result => {
            res.status(201).json({
                message: "Post created!",
                post: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })

}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                message: 'Posst fetched',
                post: post,
            })
        }

        )
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}