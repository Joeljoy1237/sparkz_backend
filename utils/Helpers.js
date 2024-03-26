const nodemailer = require('nodemailer');
const moment = require('moment');
const dotenv = require('dotenv');
dotenv.config();


const roles = {
    adminRole: "admin",
    studentRole: "student",
    teacherRole: "teacher"
}


const twohundredResponse = (data = {}) => {
    const currentTime = new Date();
    const currentHour = currentTime.getUTCHours() + 5; // Adjust for GMT+5
    const currentMinutes = currentTime.getUTCMinutes() + 30; // Adjust for GMT+30

    let greeting;

    // Determine the appropriate greeting based on the adjusted time
    if (currentHour < 12 || (currentHour === 12 && currentMinutes < 30)) {
        greeting = "Good Morning";
    } else if (currentHour < 18 || (currentHour === 18 && currentMinutes < 30)) {
        greeting = "Good Afternoon";
    } else {
        greeting = "Good Evening";
    }

    const res = {
        greeting,
        hasError: false,
        resCode: 200,
        status: "SUCCESS",
        ...data,
        timestamp: currentTime.toISOString(),
        apiVersion: "V2",
        createdBy: "Sparkz CCET technical team (Obcydians)",
    };

    // if (data?.description) {
    //     res.description = data?.description
    // }
    return res;
};

const twoNotOneResponse = (data = {}) => {
    const currentTime = new Date();
    const currentHour = currentTime.getUTCHours() + 5; // Adjust for GMT+5
    const currentMinutes = currentTime.getUTCMinutes() + 30; // Adjust for GMT+30

    let greeting;

    // Determine the appropriate greeting based on the adjusted time
    if (currentHour < 12 || (currentHour === 12 && currentMinutes < 30)) {
        greeting = "Good morning";
    } else if (currentHour < 18 || (currentHour === 18 && currentMinutes < 30)) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }
    return {
        greeting,
        hasError: false,
        resCode: 201,
        status: "SUCCESS",
        ...data,
        timestamp: currentTime.toISOString(),
        apiVersion: "V2",
        createdBy: "Sparkz CCET technical team (Obcydians)",
    };
};

const fourNotOneResponse = (data = {}) => {
    return {
        hasError: true,
        resCode: 401,
        status: "FAILURE",
        ...data,
        apiVersion: "V2"
    };
};

const fourNotFourResponse = (data = {}) => {
    return {
        hasError: true,
        resCode: 404,
        status: "FAILURE",
        ...data,
        apiVersion: "V2"
    };
};

const fourNotThreeResponse = (data = {}) => {
    return {
        hasError: true,
        resCode: 403,
        status: "FAILURE",
        message: "Token not found. Authentication failed",
        ...data,
        apiVersion: "V2"
    };
};

const fourNotNineResponse = (data = {}) => {
    return {
        hasError: true,
        resCode: 409,
        status: "FAILURE",
        ...data,
        apiVersion: "V2"
    };
};

const fourHundredResponse = (data = {}) => {
    return {
        hasError: true,
        resCode: 400,
        status: "FAILURE",
        ...data,
        apiVersion: "V2"
    };
};

const customError = (data = {}) => {
    const currentTime = new Date();
    const currentHour = currentTime.getUTCHours() + 5; // Adjust for GMT+5
    const currentMinutes = currentTime.getUTCMinutes() + 30; // Adjust for GMT+30

    let greeting;

    // Determine the appropriate greeting based on the adjusted time
    if (currentHour < 12 || (currentHour === 12 && currentMinutes < 30)) {
        greeting = "Good Morning";
    } else if (currentHour < 18 || (currentHour === 18 && currentMinutes < 30)) {
        greeting = "Good Afternoon";
    } else {
        greeting = "Good Evening";
    }

    const errorObject = {
        greeting,
        resCode: data?.resCode || "UNKNOWN_ERROR",
        status: "FAILURE",
        hasError: true,
        message: data?.message || "An unknown error occurred.",
        ...data,
        timestamp: currentTime.toISOString(),
        apiVersion: "V2",
        createdBy: "Sparkz CCET technical team (Obcydians)",
        // dev: "∞ Infinity ∞"
    };

    // Conditionally include the 'description' parameter if it has a value
    if (data?.description) {
        errorObject.description = data.description;
    }

    return errorObject;
}

const resMessages = {
    invalidMsg: "Invalid username or password!",
    accessDenied: "Access Denied",
    userNotfoundMsg: "User not found",
    notFoundMsg: "Requested resourse does not exists",
    internalErrorMsg: "Internal server error. Please try again!",
    AccountLockedMsg: 'Account is locked.',
    AuthSuccessMsg: "Authentication successful",
    userAlreadyExistsMsg: "Username already exists. Choose a different username.",
    emailAlreadyExistsMsg: "Email already exists. Choose a different email.",
    createdSuccessMsg: "Created successfully",
    tokenNotFound: "Token not found",
    unAuthorized: "Unauthorized access",
    sessionExpired: "Your session has expired",
    authFailed: "Authentication failed",
    rateLimit: "Too many requests. Please try after some time",
    passwordReset: "Password reset successfully"
}

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.MAILID,
        pass: process.env.MAILPASSKEY,
    },
});

const sanitizedUserList = (users) => {
    const userList = users.map(user => ({
        _id: user?._id,
        username: user?.username,
        email: user?.email,
        semester: user?.semester,
        department: user?.department,
        role: user?.role,
        createdAt: {
            date: moment(user?.createdAt).utcOffset('+05:30').format('DD/MM/YYYY , hh:mm A'),
            ago: moment(user?.createdAt).utcOffset('+05:30').fromNow(),
        },
        updatedAt: {
            date: moment(user?.updatedAt).utcOffset('+05:30').format('DD/MM/YYYY , hh:mm A'),
            ago: moment(user?.updatedAt).utcOffset('+05:30').fromNow(),
        },
    }));
    return userList;
}

const sanitizedLetterList = (letters) => {
    const sanitizedLetters = letters.map(letter => ({
        ...letter.toObject(),
        from: {
            _id: letter?.from?._id,
            username: letter?.from?.username,
            email: letter?.from?.email,
            semester: letter?.from?.semester,
            department: letter?.from?.department,
            role: letter?.from?.role,
        },
        createdAt: {
            date: moment(letter?.createdAt).utcOffset('+05:30').format('DD/MM/YYYY , hh:mm A'),
            ago: moment(letter?.createdAt).utcOffset('+05:30').fromNow(),
        },
        updatedAt: {
            date: moment(letter?.updatedAt).utcOffset('+05:30').format('DD/MM/YYYY , hh:mm A'),
            ago: moment(letter?.updatedAt).utcOffset('+05:30').fromNow(),
        },
    }));
    return sanitizedLetters;
}

const sanitizedLetterData = (letter) => {
    const sanitizedLetter = {
        ...letter.toObject(),
        from: {
            _id: letter?.from?._id,
            username: letter?.from?.username,
            email: letter?.from?.email,
            semester: letter?.from?.semester,
            department: letter?.from?.department,
            role: letter?.from?.role,
        },
        createdAt: {
            date: moment(letter?.createdAt).utcOffset('+05:30').format('DD/MM/YYYY , hh:mm A'),
            ago: moment(letter?.createdAt).utcOffset('+05:30').fromNow(),
        },
        updatedAt: {
            date: moment(letter?.updatedAt).utcOffset('+05:30').format('DD/MM/YYYY , hh:mm A'),
            ago: moment(letter?.updatedAt).utcOffset('+05:30').fromNow(),
        },
    }
    return sanitizedLetter
}

const abstractedUserData = (userObj, updated) => {
    console.log(userObj)
    const { loginAttempts, lockUntil, lastUpdatedBy, resetTokenUsed, ...userAbstractedObj } = userObj._doc;
    const newData = {
        _id: userAbstractedObj?._id,
        firstName: userAbstractedObj?.firstName,
        lastName: userAbstractedObj?.lastName,
        email: userAbstractedObj?.email,
        semester: userAbstractedObj?.semester,
        department: userAbstractedObj.department,
        college: userAbstractedObj.college,
        // createdAt: {
        //     date: moment(userAbstractedObj?.createdAt).utcOffset('+05:30').format('DD/MM/YYYY , hh:mm A'),
        //     ago: moment(userAbstractedObj?.createdAt).utcOffset('+05:30').fromNow(),
        // },
    }

    if (updated) {
        newData.updatedAt = {
            date: moment(userAbstractedObj?.updatedAt).utcOffset('+05:30').format('DD/MM/YYYY , hh:mm A'),
            ago: moment(userAbstractedObj?.updatedAt).utcOffset('+05:30').fromNow(),
        }
    }
    return newData;
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

const abstractedEventList = (events)=>{
    const sanitizedEventList = events.map(event => ({
        // ...event.toObject(),
        _id:event?._id,
        imgUrl:event?.posterImg,
    }));

    return sanitizedEventList;
}

module.exports = {
    roles,
    twoNotOneResponse,
    twohundredResponse,
    fourNotOneResponse,
    fourNotFourResponse,
    fourNotThreeResponse,
    fourNotNineResponse,
    fourHundredResponse,
    sanitizedUserList,
    abstractedUserData,
    sanitizedLetterList,
    sanitizedLetterData,
    customError,
    formatDate,
    resMessages,
    transporter,
    abstractedEventList
}