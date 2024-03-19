const express = require("express");
const router = express.Router();
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const verifyToken = require("../utils/authMiddleware");

dotenv.config();

const {
  roles,
  twohundredResponse,
  resMessages,
  twoNotOneResponse,
  sanitizedUserList,
  abstractedUserData,
  customError,
  sanitizedLetterList,
  sanitizedLetterData,
  formatDate,
} = require("../Utils/Helpers");

const saltRounds = 12;

// Register endpoint
router.post("/register", async (req, res) => {
  try {
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
    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (passwordMatch) {
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
      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({ message: "Protected route accessed" });
});
module.exports = router;
