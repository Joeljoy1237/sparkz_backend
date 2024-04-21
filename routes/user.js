const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const Auth = require("../libs/Auth");
//models
const User = require("../Models/User");
const Event = require("../Models/Event");
const Register = require("../Models/Register");
const { customError, resMessages, twohundredResponse, abstractedUserData, abstractedEventList, twoNotOneResponse } = require("../utils/Helpers");
dotenv.config();
const saltRounds = 12;

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      password,
      semester,
      college,
      department,
    } = req.body;

    if (
      !email &&
      !firstName &&
      !lastName &&
      !password &&
      !semester &&
      !college &&
      !department
    ) {
      throw { status: 400, message: "Please fill the required fields" };
    }

    if (!firstName) {
      throw { status: 400, message: "first name field is required" };
    } else if (!password) {
      throw { status: 400, message: "Password field is required" };
    } else if (!email) {
      throw { status: 400, message: "Email field is required" };
    } else if (!department) {
      throw { status: 400, message: "Department field is required" };
    } else if (!semester) {
      throw { status: 400, message: "Semester field is required" };
    } else if (!lastName) {
      throw { status: 400, message: "Last name field is required" };
    }

    const userExist = await User.findOne({ email: req.body.email });

    if (userExist) {
      throw {
        status: 409,
        message: "User already exists",
        description: "Please try again with another email",
      };
    }

    if (!userExist) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        semester,
        college,
        department,
      });
      await user.save();
      const successResponse = twohundredResponse({
        message: "Registered successfully",
        description: "Please login to continue",
        redirectUrl: "/login",
      });
      return res.status(200).json(successResponse);
    }
  } catch (error) {
    console.error(error);
    const status = error?.status || 500;
    const message = error?.message || "Internal Server Error";
    const description = error?.description;
    const errorMessage = customError({ resCode: status, message, description });
    return res.status(status).json(errorMessage);
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw { status: 404, message: resMessages.userNotfoundMsg };
    }
    if (user.lockUntil > new Date()) {
      const timeDifferenceInMilliseconds = user.lockUntil - new Date();
      const timeDifferenceInMinutes = Math.ceil(
        timeDifferenceInMilliseconds / (1000 * 60)
      );

      throw {
        status: 403,
        message: `Account locked .Please try again after ${timeDifferenceInMinutes} minutes`,
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 3) {
        user.lockUntil = new Date(Date.now() + 10 * 60 * 1000); // Lock for 10 minutes
      }

      await user.save();

      throw { status: 400, message: "Invalid username or password" };
    }

    user.loginAttempts = 0;
    user.lockUntil = new Date(0);
    await user.save();

    const token = jwt.sign(
      {
        email: user?.email,
        userId: user._id,
      },
      "sparkz",
      { expiresIn: "1w" }
    );

    const successResponseMsg = twohundredResponse({
      message: "Login successfull.",
      accessToken: token,
    });
    return res.status(200).json(successResponseMsg);
  } catch (error) {
    console.error(error);
    const status = error?.status || 500;
    const message = error?.message || "Internal Server Error";
    const description = error?.description;
    const errorMessage = customError({ resCode: status, message, description });
    return res.status(status).json(errorMessage);
  }
});


//get user details
router.get('/getUserDetails', Auth.verifyUserToken, async (req, res) => {
  try {
    const userData = req.user;
    const user = abstractedUserData(userData);
    const registered = await Register.find({ registeredUser: req.userId }).populate('event', 'title department date time type price regFee posterImg');
    console.log(req.userId)
    const sanitizedEventList = registered.map(event => ({
      title: event?.title,
      imgUrl: event?.posterImg,
      ...event.toObject(),
    }));

    console.log(sanitizedEventList)

    user.registeredEvents = sanitizedEventList;

    const successResponse = twohundredResponse({ message: "Here's your details:", data: user })
    return res.status(200).json(successResponse);
  } catch (error) {
    console.error(error);
    const status = error?.status || 500;
    const message = error?.message || "Internal Server Error";
    const description = error?.description;
    const errorMessage = customError({ resCode: status, message, description });
    return res.status(status).json(errorMessage);
  }
})

//user profile
// router.get("/:userid/profile", verifyUserToken, async (req, res) => {
//   const getUserId = req.params.userid;
//   console.log(getUserId);
//   try {
//     const registered = await Register.find({
//       registeredUserId: getUserId,
//     })
//       .populate("registeredUserId")
//       .populate("eventId");
//     if (registered) {
//       return res.status(200).json({ data: registered });
//     }
//   } catch (err) {
//     console.error("Error fetching: ", err);
//     return res
//       .status(500)
//       .json({ message: "Failed to fetch Registered events" });
//   }
// });
// //fetch data for each department
// router.get("/events/:department", async (req, res) => {
//   try {
//     const searchDep = req.params.department;
//     const events = await Event.find({ department: searchDep });
//     return res.status(200).json({ data: events });
//   } catch (err) {
//     console.error("Error fetching events:", err);
//     return res.status(500).json({ message: "Failed to fetch events" });
//   }
// });

//get event list -- not protected route
router.get('/getEventList/:dep', async (req, res) => {
  try {
    const depId = req.params.dep.toUpperCase();
    const events = await Event.find({ department: depId });
    console.log(events)
    const eventList = abstractedEventList(events)
    const successResponse = twohundredResponse({ status: 200, message: "Event list", data: eventList });
    return res.status(200).json(successResponse)
  } catch (error) {
    console.error(error);
    const status = error?.status || 500;
    const message = error?.message || "Internal Server Error";
    const description = error?.description;
    const errorMessage = customError({ resCode: status, message, description });
    return res.status(status).json(errorMessage);
  }
})

//api to check whether registered already
router.get('/getEventListForLoggedInUsers/:dep', Auth.verifyUserToken, async (req, res) => {
  try {
    const depId = req.params.dep.toUpperCase();
    const events = await Event.find({ department: depId });
    console.log(req.userId)
    // const registeredEvents = await Register.find({ registeredUser: req.userId, eventId: { $in: events.map(event => event._id) } }).populate('event');
    const registeredEvents = await Register.find({ registeredUser: req.userId })
      .populate('event')
      .exec();

    console.log(registeredEvents)
    // Map events to add isRegistered parameter
    const eventList = events.map(event => {
      // Check if the event is in registeredEvents
      const isRegistered = registeredEvents.some(regEvent => regEvent.event.equals(event._id));
      // Return the event with isRegistered parameter
      return {
        ...event.toObject(),
        isRegistered
      };
    });

    const successResponse = twohundredResponse({ status: 200, message: "Event list", data: eventList });
    return res.status(200).json(successResponse);
  } catch (error) {
    console.error(error);
    const status = error?.status || 500;
    const message = error?.message || "Internal Server Error";
    const description = error?.description;
    const errorMessage = customError({ resCode: status, message, description });
    return res.status(status).json(errorMessage);
  }
});



// //user register new event
router.post("/eventRegister", Auth.verifyUserToken, async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) {
      throw { status: 400, message: "Invalid event id" }
    }
    const existingRegistration = await Register.findOne({ registeredUser: req.userId, event: eventId });
    if (existingRegistration) {
      throw { status: 400, message: "You have already registered for this event" };
    }
    const newRegistration = new Register({ registeredUser: req.userId, event: eventId });
    await newRegistration.save();
    const successResponse = twoNotOneResponse({ status: 201, message: "Registered successfully" })
    return res.status(201).json(successResponse);
  } catch (error) {
    console.error(error);
    const status = error?.status || 500;
    const message = error?.message || "Internal Server Error";
    const description = error?.description;
    const errorMessage = customError({ resCode: status, message, description });
    return res.status(status).json(errorMessage);
  }
});


//api to get featured events -- not protected route
router.get('/getFeaturedEvents', async (req, res) => {
  try {
    const events = await Event.find({ isFeatured: true });
    const successResponse = twohundredResponse({ message: "Featured events", data: events, eventsCount: events?.length });
    return res.status(200).json(successResponse);
  } catch (error) {
    console.error(error);
    const status = error?.status || 500;
    const message = error?.message || "Internal Server Error";
    const description = error?.description;
    const errorMessage = customError({ resCode: status, message, description });
    return res.status(status).json(errorMessage);
  }
});

//api to list all events -- not protected route
router.get('/getAllEvents', async (req, res) => {
  try {
    const events = await Event.find().sort({ title: "desc" })
    const successResponse = twohundredResponse({ message: "Featured events", data: events, eventsCount: events?.length });
    return res.status(200).json(successResponse);
  } catch (error) {
    console.error(error);
    const status = error?.status || 500;
    const message = error?.message || "Internal Server Error";
    const description = error?.description;
    const errorMessage = customError({ resCode: status, message, description });
    return res.status(status).json(errorMessage);
  }
})

//api to get single event details
router.post('/getEventDetailsById', async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById({ _id: eventId });
    if (!event) {
      throw { status: 404, message: "Opps!!! Event doesn't exists" }
    }
    const successResponse = twohundredResponse({ message: "Event details", data: event });
    return res.status(200).json(successResponse);
  } catch (error) {
    console.error(error);
    const status = error?.status || 500;
    const message = error?.message || "Internal Server Error";
    const description = error?.description;
    const errorMessage = customError({ resCode: status, message, description });
    return res.status(status).json(errorMessage);
  }
})

router.post('/getEventDetailsByIdForLoggedInUsers', Auth.verifyUserToken, async (req, res) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      const errorMessage = customError({ resCode: 404, message: "Event not found" });
      return res.status(404).json(errorMessage);
    }

    const isRegistered = await Register.findOne({ registeredUser: req.userId, event: eventId });
    console.log(isRegistered)
    // Add isRegistered parameter to event object
    if (isRegistered) {
      event.isRegistered = true;
    }

    const successResponse = twohundredResponse({ status: 200, message: "Event Details", data: event });
    return res.status(200).json(successResponse);
  } catch (error) {
    console.error(error);
    const status = error?.status || 500;
    const message = error?.message || "Internal Server Error";
    const description = error?.description;
    const errorMessage = customError({ resCode: status, message, description });
    return res.status(status).json(errorMessage);
  }
});




//api to register for team events

router.post('/registerWithTeam', Auth.verifyUserToken, async (req, res) => {
  try {
    const { eventId, team } = req.body;

    // Check if eventId is provided and valid
    // if (!mongoose.Types.ObjectId.isValid(eventId)) {
    //   throw { status: 400, message: "Invalid eventId" };
    // }

    // Create an array to store team members
    const teamMembers = [];

    // Iterate over each team member data and validate
    for (const memberData of team) {
      const { studentName, class: studentClass, school, schoolAddress } = memberData;

      // Check if required fields are provided
      if (!studentName || !studentClass || !school || !schoolAddress) {
        throw { status: 400, message: "Incomplete student data" };
      }

      // Push validated team member data to teamMembers array
      teamMembers.push({ studentName, class: studentClass, school, schoolAddress });
    }

    // Create a new registration entry with event ID and team data
    const registration = new Register({
      registeredUser: req.user._id, // Assuming authenticated user's ID is stored in req.user._id
      event: eventId,
      team: teamMembers
    });

    // Save the registration
    await registration.save();

    // Respond with success message
    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.error(error);
    const status = error?.status || 500;
    const message = error?.message || "Internal Server Error";
    const description = error?.description;
    const errorMessage = customError({ resCode: status, message, description });
    return res.status(status).json(errorMessage);
  }
});

module.exports = router;
