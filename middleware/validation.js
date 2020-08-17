const {
    body,
    validationResult
} = require('express-validator');

exports.signUpValidationRules = () => {
    return [
        // username must be an email
        body("firstName").notEmpty().isLength({
            min: 3
        }).isAlpha().trim().escape().withMessage("Name must have more than 3 characters"),
        body("lastName").notEmpty().isLength({
            min: 3
        }).isAlpha().trim().escape().withMessage("Name must have more than 3 characters"),
        body("username").notEmpty().isLength({
            min: 3
        }).isAlpha().trim().escape().withMessage("Name must have more than 3 characters"),
        body("email").notEmpty().isEmail().normalizeEmail().withMessage("Email is required"),
        body("password").notEmpty().isLength({
            min: 5
        }).withMessage("Password must have at least 5 characters"),
        body("confirmPassword").notEmpty().isLength({
            min: 5
        }).withMessage("Password must have at least 5 characters"),
        body("phoneNumber").notEmpty().matches(/^[0][0-9]{10}$/),
        body("role").notEmpty().isAlpha(),
    ]
}

exports.loginValidationRules = () => {
    return [
        body("username").notEmpty().withMessage("Username is required"),
        body("password").notEmpty().withMessage("Password is Required")
    ]
}

exports.ResetPasswordValidationRules = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old Password is Required"),
        body("newPassword").notEmpty().withMessage("New Password is Required"),
        body("confirmPassword").notEmpty().withMessage("Confirm Password is Required")
    ]
}




exports.validation = (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (errors.isEmpty()) {
            return next()
        }
        const extractedErrors = []
        errors.array().map(err => extractedErrors.push({
            [err.param]: err.msg
        }))

        return res.status(422).json({
            errors: extractedErrors,
        })

    } catch {
        res.status(401).json({
            error: "Unauthorized",
            status: "error"
        })
    }
}