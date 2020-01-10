const User = require('../models/user');
const bcrypt = require('bcryptjs');

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
    }
};