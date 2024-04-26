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
const XLSX = require('xlsx');
const multer = require('multer');
const Question = require("../Models/Question");
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });
const pdf = require('pdf-parse');
const TestQuestion = require("../Models/TestQuestion");

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
      mobileNo
    } = req.body;

    if (
      !email &&
      !firstName &&
      !lastName &&
      !password &&
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
      throw { status: 400, message: "Department/Class field is required" };
    } else if (!lastName) {
      throw { status: 400, message: "Last name field is required" };
    } else if (!mobileNo) {
      throw { status: 400, message: "Mobile number field is required" };
    } else if (!college) {
      throw { status: 400, message: "College/School field is required" };
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
        mobileNo
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
    const successResponse = twohundredResponse({ status: 200, message: "Event list", data: events });
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
    // Add isRegistered parameter to event object

    const successResponse = twohundredResponse({ status: 200, message: "Event Details", data: event, registerStatus: isRegistered ? true : false });
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
    const { eventId, team, dep } = req.body;

    // Check if eventId is provided and valid
    // if (!mongoose.Types.ObjectId.isValid(eventId)) {
    //   throw { status: 400, message: "Invalid eventId" };
    // }

    // Create an array to store team members
    const teamMembers = [];

    // Iterate over each team member data and validate
    for (const memberData of team) {
      const { studentName, class: studentClass, dob, school, schoolAddress, email, mobNo, semester, college } = memberData;

      // Check if required fields are provided
      if (dep === "BSC") {
        if (!studentName && !studentClass && !school && !schoolAddress && !dob) {
          throw { status: 400, message: "Please fill the required fields" };
        }
        if (!studentName || studentName === "") {
          throw { status: 400, message: "Name is required" };
        } else if (!studentClass || studentClass === "") {
          throw { status: 400, message: "Class is required" };
        } else if (!school || school === "") {
          throw { status: 400, message: "School is required" };
        } else if (!schoolAddress || schoolAddress === "") {
          throw { status: 400, message: "schoolAddress is required" };
        } else if (!dob || dob === "") {
          throw { status: 400, message: "Dob is required" };
        }
      } else {
        if (!studentName && !email && !semester && !college && !mobNo) {
          throw { status: 400, message: "Please fill the required fields" };
        }
        if (!studentName || studentName === "") {
          throw { status: 400, message: "Name is required" };
        } else if (!email || email === "") {
          throw { status: 400, message: "Email is required" };
        } else if (!semester || semester === "") {
          throw { status: 400, message: "Semester is required" };
        } else if (!college || college === "") {
          throw { status: 400, message: "College is required" };
        } else if (!mobNo || mobNo === "") {
          throw { status: 400, message: "Mobile number is required" };
        }
      }

      // Push validated team member data to teamMembers array
      teamMembers.push({ studentName, class: studentClass, school, schoolAddress, email, mobNo, semester, college, dob });
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
    const successResponse = twohundredResponse({ status: 200, message: "Registration successful" });
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


//keam
router.post('/uploadQuestions', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      throw { status: 400, message: 'File not provided' };
    }

    const fileData = req.file.buffer;
    const workbook = XLSX.read(fileData, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw { status: 400, message: 'No sheet found in the Excel file' };
    }

    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    if (!jsonData || jsonData.length === 0) {
      throw { status: 400, message: "No data found in the Excel sheet" };
    }

    // Map Excel data to MongoDB schema
    const questionsToInsert = await Promise.all(jsonData.map(async (rowData) => {
      // Extract fields from the Excel row
      const { question, a, b, c, d, e, correct } = rowData;
      console.log(question)
      // Construct the question object for MongoDB
      return {
        question, // Assuming 'question' field exists in the Excel
        a, b, c, d, e, correct  // Assuming these fields exist in the Excel
      };
    }));

    // Insert questions into MongoDB
    const questions = await Question.insertMany(questionsToInsert);
    // const questions = await TestQuestion.insertMany(questionsToInsert);

    const successResponse = twoNotOneResponse({ message: `${questions.length} question data added successfully`, accessToken: req.accessToken });
    // const successResponse = twoNotOneResponse({ data:questionsToInsert, accessToken: req.accessToken });
    return res.status(201).json(successResponse);
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    const errorMessage = customError({ resCode: status, message });
    return res.status(status).json(errorMessage);
  }
});



//api to get questions
router.get('/getAllQuestion', async (req, res) => {
  try {
    const questions = await Question.find();

    // Parse each question from string to objec

    const successResponse = twohundredResponse({ message: "Question details:", data: questions });
    return res.status(200).json(successResponse);
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    const errorMessage = customError({ resCode: status, message });
    return res.status(status).json(errorMessage);
  }
});

//api to enter question
router.post('/insertQuestion', async (req, res) => {
  try {
    const { question, a, b, c, d, e, correct } = req.body;
    if (!question) {
      throw { status: 400, message: "Question is required" };
    } else if (!a) {
      throw { status: 400, message: "Option A is required" };
    } else if (!b) {
      throw { status: 400, message: "Option B is required" };
    } else if (!c) {
      throw { status: 400, message: "Option C is required" };
    } else if (!d) {
      throw { status: 400, message: "Option D is required" };
    } else if (!e) {
      throw { status: 400, message: "Option E is required" };
    } else if (!correct) {
      throw { status: 400, message: "Correct is required" };
    }
    // Parse each question from string to object
    const newQuestion = new Question({
      question,
      a,
      b,
      c,
      d,
      e,
      correct
    });

    const questionDetail = await newQuestion.save();

    const successResponse = twohundredResponse({ message: "Question insterted:", data: questionDetail });
    return res.status(200).json(successResponse);
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    const errorMessage = customError({ resCode: status, message });
    return res.status(status).json(errorMessage);
  }
});

//api to login student
router.post('/keamLogin', async (req, res) => {
  try {
    const { email, dob } = req.body;
    if (!email || email === "") {
      throw { status: 400, message: "Email is required" }
    } else if (!dob || dob === "") {
      throw { status: 400, messaeg: "Date of birth is required" }
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw { status: 404, message: "User doesn't exists" }
    }

    const isFound = await Register.findOne({ registeredUser: user?._id });
    if (dob !== isFound?.team[0]?.dob) {
      throw { status: 400, message: "Date of birth mismatch" }
    }

    const token = jwt.sign(
      {
        email: user?.email,
        userId: user._id,
        dob: dob
      },
      "keam_mock",
      { expiresIn: "1w" }
    );


    const successResponse = twohundredResponse({ status: 200, message: "Loggedin successfully", accessToken: token });
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

router.get('/getKeamQuestions',Auth.verifyKeamUserToken, async (req, res) => {
  try {
    const questions = await Question.aggregate([
      { $sample: { size: 10 } } 
    ]);

    const successResponse = twohundredResponse({ message: "Shuffled question details:", data: questions });
    return res.status(200).json(successResponse);
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    const errorMessage = customError({ resCode: status, message });
    return res.status(status).json(errorMessage);
  }
});

//apit to check correct answer
router.post('/submitAnswers',Auth.verifyKeamUserToken, async (req, res) => {
  try {
    const { userId, answers } = req.body;

    // Initialize score
    let score = 0;

    // Iterate through each answer
    for (const answer of answers) {
      // Find the question from the database using _id
      const question = await Question.findById(answer._id);

      // If question not found, continue to the next answer
      if (!question) continue;

      // Check if chosen option matches the correct option in the question
      if (answer.chosenOption === question.correct) {
        // If correct, increment score by 4
        score += 4;
      } else {
        // If incorrect, decrement score by 1
        score -= 1;
      }
    }

    // Update the User model with the calculated score
    await User.findByIdAndUpdate(userId, { keamScore: score });

    // Prepare response with score
    const response = {
      message: "Score calculated and updated successfully",
      score: score
    };

    // Send the response
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    const errorMessage = customError({ resCode: status, message });
    return res.status(status).json(errorMessage);
  }
});


//api to calculate the winners
router.get('/winners', async (req, res) => {
  try {
    // Find all users and select only required fields
    const users = await User.find({}, 'firstName lastName email keamScore');

    // Sort users by keamScore in descending order
    const sortedUsers = users.sort((a, b) => b.keamScore - a.keamScore);

    // Prepare response with sorted users
    const response = {
      message: "Winners retrieved successfully",
      winners: sortedUsers
    };

    // Send the response
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    const errorMessage = customError({ resCode: status, message });
    return res.status(status).json(errorMessage);
  }
});


router.get('/getKeamUserDetails', Auth.verifyKeamUserToken, async (req, res) => {
  try {
    const userData = req.user;
    const user = abstractedUserData(userData);
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

module.exports = router;
