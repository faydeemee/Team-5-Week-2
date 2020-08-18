const User = require('../model/user');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
    successResMsg,
    errorResMsg
} = require("../utils/responseHandler");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.signUp = async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        })

        const username = await User.findOne({
            username: req.body.username
        })
        if (user) {
            return errorResMsg(res, 423, "This user already exists");
        }
        if (username) {
            return errorResMsg(res, 423, "This username already exists");
        }
        const newUser = await User.create(req.body);
        const token = jwt.sign({
                id: newUser._id,
                role: newUser.role
            },
            process.env.JWT_SECRET
        );
        const data = {
            id: newUser._id,
            role: newUser.role,
            token
        }
        return successResMsg(res, 201, data);
    } catch (err) {
        return errorResMsg(res, 500, err);
    }
}

exports.logIn = async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body
        const user = await User.findOne({
            username
        }).select("+password");
        if (!user || !(await user.correctPassword(password, user.password))) {
            return errorResMsg(res, 401, "Incorrect email or password");
        }

        const token = jwt.sign({
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET
        );
        const data = {
            id: user._id,
            role: user.role,
            token
        }
        return successResMsg(res, 200, data);

    } catch (err) {
        return errorResMsg(res, 500, err);
    }
}

exports.resetPassword = async (req, res) => {

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const id = decodedToken.id;
        const {
            oldPassword,
            newPassword,
        } = req.body

        const realuser = await User.findOne({
            _id: id
        }).select("+password");

        if (!realuser || !(await realuser.correctPassword(oldPassword, realuser.password))) {
            return errorResMsg(res, 401, "Incorrect password");
        }

        const password = await bcrypt.hash(newPassword, 12)

        const user = await User.findByIdAndUpdate(id, {
            password,
        }, {
            new: true,
        });

        return successResMsg(res, 200, user);

    } catch (err) {
        return errorResMsg(res, 500, err);
    }
}

exports.imageUpload = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const id = decodedToken.id;
        cloudinary.uploader.upload(req.file.path, async (error, result) => {
            if (result) {
                let image = result.secure_url;
                const user = await User.findByIdAndUpdate(id, {
                    image,
                }, {
                    new: true,
                });

                return successResMsg(res, 200, user);
            }
        });
       
    } catch (err) {
        return errorResMsg(res, 500, err);
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const id = decodedToken.id;
        
        const user = await User.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        return successResMsg(res, 200, user);

    }catch (err){
        return errorResMsg(res, 500, err);
    }
}

exports.getProfileData = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const id = decodedToken.id;
        const user = await User.find({_id:id});
        return successResMsg(res, 200, user);
    }catch(err){
        return errorResMsg(res, 500, err);
    }
}