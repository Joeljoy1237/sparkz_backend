const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const verifyToken = require("../utils/authMiddleware");
//models
const User = require("../Models/User");
const Event = require("../Models/Event");
const Register = require("../Models/Register");

dotenv.config();

// const {
//   roles,
//   twohundredResponse,
//   fourNotNineResponse,
//   resMessages,
//   twoNotOneResponse,
//   sanitizedUserList,
//   abstractedUserData,
//   customError,
//   sanitizedLetterList,
//   sanitizedLetterData,
//   formatDate,
// } = require("../Utils/Helpers");

const saltRounds = 12;

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const userExist = await User.findOne({ email: req.body.email });
    if (!userExist) {
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        semester: req.body.semester,
        college: req.body.college,
        department: req.body.department,
      });
      await user.save();
      return res.status(200).json({ status: "ok" });
    }
    res.status(409).json({
      message: "error",
      status: 409,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.lockUntil > new Date()) {
      const timeDifferenceInMilliseconds = user.lockUntil - new Date();
      const timeDifferenceInMinutes = Math.ceil(
        timeDifferenceInMilliseconds / (1000 * 60)
      );

      throw {
        status: 403,
        // message: resMessages.AccountLockedMsg,
        description: `Please try again after ${timeDifferenceInMinutes} minutes`,
      };
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (passwordMatch) {
      user.loginAttempts = 0;
      user.lockUntil = new Date(0);
      await user.save();
      const token = jwt.sign(
        {
          userId: user._id,
          username: { firstName: user.firstName, lastName: user.lastName },
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      return res.status(200).json({ token });
    } else {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 3) {
        user.lockUntil = new Date(Date.now() + 10 * 60 * 1000); // Lock for 10 minutes
      }
      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ error: err.description || "Internal server error" });
  }
});

router.post("/:userid/event/register", async (req, res) => {
  const getUserId = req.params.userid;
  const eventId = req.body.event;
  console.log(req.body);
  const reg = new Register({ registeredUserId: getUserId, eventId: eventId });
  reg.save();
  res.status(201).json({ status: "ok" });
  try {
  } catch (err) {
    console.error("Error fetching: ", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch Registered events" });
  }
});

router.get("/:userid/profile", async (req, res) => {
  const getUserId = req.params.userid;
  try {
    const registered = await Register.find({
      registeredUserId: getUserId,
    })
      .populate("registeredUserId")
      .populate("eventId");
    if (registered) {
      return res.status(200).json({ data: registered });
    }
  } catch (err) {
    console.error("Error fetching: ", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch Registered events" });
  }
});

router.get("/events/:department", async (req, res) => {
  try {
    const searchDep = req.params.department;
    const events = await Event.find({ department: searchDep });
    return res.status(200).json({ data: events });
  } catch (err) {
    console.error("Error fetching events:", err);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
});

module.exports = router;
