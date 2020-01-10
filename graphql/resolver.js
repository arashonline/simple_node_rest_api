const User = require('../models/user');
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
    createUser: async function({ userInput }, req) {
        const errors = [];
        if(!validator.isEmail(userInput.email)){
            errors.push({
                message: 'E-mail is invalid.'
            })
        }
        if(validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, {min:5, max:16})){
            errors.push({
                message: 'Password Too Short!'
            })
        }
        if(errors.length > 0 ){
            const error = new Error('Invalid Input.');
            error.data = errors;
            error.code = 422;
            throw error
        }
        const existingUser = await User.findOne({email: userInput.email});

        if(existingUser){
            const error = new Error('User Exists Already!');
            throw error;
        }
        const hashedPass = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashedPass,
        });

        const createdUser= await user.save();
        return {...createdUser._doc, _id: createdUser._id.toString()}
    },
    login: async function({ email, password}){
        const user = await User.findOne({email:email});
        if(!user){
            const error = new Error('User not found.');
            error.code = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password,user.password);
        if(!isEqual){
            const error = new Error('User not found.');
            error.code = 401;
            throw error; 
        }
        const token = jwt.sign({
            userId:user._id.toString(),
            email: user.email
        },'someasdkfjasl;dkfjaskl;d',{ expiresIn: '1h'});

        return {token:token, userId:user._id.toString()}
    }


};