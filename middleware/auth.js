const jwt = require("jsonwebtoken");
const {
    successResMsg,
    errorResMsg
} = require("../utils/responseHandler");

exports.authentication = (...roles) => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const role = decodedToken.role;
            if (!roles.includes(role)) {
                return errorResMsg(res, 401, "unauthorized");
            } else {
                next();
            }
        } catch {
            return errorResMsg(res, 401, "unauthorized");
        }
    };
};