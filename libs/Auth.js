const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const { resMessages, customError } = require('../utils/Helpers');

// Middleware to verify JWT tokens for checking admin authorization
const verifyUserToken = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            throw { status: 403, message: resMessages.tokenNotFound }
        }
        let token = req.headers.authorization.split(" ")[1];

        if (!token) {
            throw { status: 403, message: resMessages.tokenNotFound }
        }

        const decoded = jwt.verify(token, 'sparkz');
        const user = await User.findOne({ _id: decoded.userId })
        console.log("Requesting user => \n", user);

        if (!user) {
            throw { status: 403, message: "Access denied" }
        }
        req.userId = decoded?.userId
        req.accessToken = token
        req.user = user
        next();
    } catch (error) {
        console.log(error)
        if (error.name === 'TokenExpiredError') {
            const errorMessage = customError({ resCode: 2215, message: resMessages.sessionExpired, description: 'Please login again to continue.' })
            return res.status(401).json(errorMessage);
        }
        const status = error.status || 500;
        const message = error.message || 'Internal Server Error';
        const errorMessage = customError({ resCode: status, message })
        return res.status(status).json(errorMessage);
    }
};

// Middleware to verify JWT tokens for checking student authorization
// const verifyStudentToken = async (req, res, next) => {
//     try {
//         if (!req.headers.authorization) {
//             throw { status: 403, message: resMessages.accessDenied }
//         }

//         let token = req.headers.authorization.split(" ")[1];
//         console.log(token)

//         if (!token) {
//             throw { status: 403, message: resMessages.tokenNotFound }
//         }
//         console.log(token)
//         const decoded = jwt.verify(token, 'carmelpoly');
//         const user = await User.findOne({ _id: decoded.userId })

//         if (!user) {
//             throw { status: 403, message: "Access denied" }
//         }

//         console.log("Requesting user => \n", user)

//         if (decoded.username !== user?.username && decoded.role !== "student") {
//             throw { status: 401, message: resMessages.unAuthorized }
//         }

//         if (decoded.role === "student" && user?.role === "student") {
//             req.userId = decoded?.userId
//             req.accessToken = token
//             req.user = user
//             next();
//         } else {
//             throw { status: 401, message: resMessages.unAuthorized }
//         }
//     } catch (error) {
//         console.log(error)
//         if (error.name === 'TokenExpiredError') {
//             const errorMessage = customError({ resCode: 2215, message: resMessages.sessionExpired, description: 'Please login again to continue.' })
//             return res.status(401).json(errorMessage);
//         }
//         const status = error.status || 500;
//         const message = error.message || 'Internal Server Error';
//         const errorMessage = customError({ resCode: status, message })
//         return res.status(status).json(errorMessage);
//     }
// };

module.exports = {
    verifyUserToken,
};