const User = require('../models/user');
const Post = require('../models/post');

const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

// we need a method for every query or mutation in shcema
module.exports = {
    //    createUser(args, req) {
    //     //    one option is to get arguments as bellow 
    //     //    const email = args.userInput.email;
    //    }

    //    createUser({ userInput }, req) {
    //        const email = userInput.email
    //        return user.findOne({email: userInput.email})
    //        .then()
    //        .catch()
    //    }

    // using async await method 
    createUser: async function ({ userInput }, req) {
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({
                message: 'E-mail is invalid.'
            })
        }
        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 5, max: 16 })) {
            errors.push({
                message: 'Password Too Short!'
            })
        }
        if (errors.length > 0) {
            const error = new Error('Invalid Input.');
            error.data = errors;
            error.code = 422;
            throw error
        }
        const existingUser = await User.findOne({ email: userInput.email });

        if (existingUser) {
            const error = new Error('User Exists Already!');
            throw error;
        }
        const hashedPass = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashedPass,
        });

        const createdUser = await user.save();
        return { ...createdUser._doc, _id: createdUser._id.toString() }
    },
    login: async function ({ email, password }) {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('User not found.');
            error.code = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('User not found.');
            error.code = 401;
            throw error;
        }
        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email
        }, 'ksjdflkasjdflkasjdfhhasdklfhlk123', { expiresIn: '1h' });

        return { token: token, userId: user._id.toString() }
    },
    createPost: async function ({ postInput }, req) {
        if(!req.isAuth){
            const error = new Error('Not Authenticated.');
            error.code = 401;
            throw error
        }
        const errors = [];
        if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 })) {
            errors.push({
                message: 'Title should be more than three characters.'
            })
        }
        if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
            errors.push({
                message: 'Content is not valid.'
            })
        }
        if (errors.length > 0) {
            const error = new Error('Invalid Input.');
            error.data = errors;
            error.code = 422;
            throw error
        }

        // now we can proceed with creating post 

        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error('Invalid User.');
            error.code = 401;
            throw error
        }

        const post = new Post({
            title:postInput.title,
            content:postInput.content,
            imageUrl:postInput.imageUrl,
            creator: user
        });

        const createdPost = await post.save()

        user.posts.push(createdPost);
        await user.save()

        return {...createdPost._doc, 
            _id:createdPost._id.toString(),
             createdAt:createdPost.createdAt.toISOString(),
             updatedAt:createdPost.updatedAt.toISOString(),
            }
    },
    posts: async function({page},req){
        if(!req.isAuth){
            const error = new Error('Not Authenticated.');
            error.code = 401;
            throw error
        }

        if(!page){
            page = 1;
        }
        const perPage = 2;
        const totalPosts = await Post.find().countDocuments()
        const posts = await Post.find()
        .sort({createdAt: -1 })
        .skip((page-1)*perPage)
        .limit(perPage)
        .populate('creator');

        return {
            posts: posts.map(p=>{
                return {...p._doc,
                     _id:p._id.toString(),
                     createdAt:p.createdAt.toISOString(),
                     updatedAt:p.updatedAt.toISOString(),
                }
            }),
            totalPosts:totalPosts
        }
    }


};