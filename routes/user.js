const express = require("express");
const router = express.Router();
const userController = require("../controller/user");
const {
    signUpValidationRules,
    loginValidationRules,
    ResetPasswordValidationRules,
    validation
} = require("../middleware/validation")
const auth = require("../middleware/auth");




router.post('/signup', signUpValidationRules(), validation, userController.signUp);
router.post('/login', loginValidationRules(), validation, userController.logIn);
router.patch('/resetpassword', auth.authentication("user", "admin"), ResetPasswordValidationRules(), validation, userController.resetPassword);
//router.post('/forgotpassword', userController.logIn)


module.exports = router;