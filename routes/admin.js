const express = require("express");
const router = express.Router();
const Event = require("../Models/Event");
const { customError, twoNotOneResponse, twohundredResponse } = require("../utils/Helpers");
const Register = require("../Models/Register");
const Question = require("../Models/Question");

router.post("/newevent", async (req, res) => {
  try {
    const data = { ...req.body };
    const event = new Event({
      title: data.title,
      department: data.department,
      regFee: data.regFee,
      isFeatured: data.isFeatured,
      firstPrize: data.firstPrize,
      secondPrize: data.secondPrize,
      thirdPrize: data.thirdPrize,
      priceCount: data.priceCount,
      type: data.type,
      date: data.date,
      time: data.time,
      desc: data.desc,
      teamCountMax: data.teamCountMax,
      teamCountMin: data.teamCountMin,
      venue: data.venue,
      rules: data.rules,
      isTeam: data.isTeam,
      posterImg: data.posterImg,
      cordinator: data.cordinator,
    });

    await event.save();
    const successResponse = twoNotOneResponse({
      success: true,
      message: "Event created successfully",
      event: event // Optionally, send back the created event
    })
    return res.status(201).json(successResponse);
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    const message = error.message || "Internal Server Error";
    const description = error.description || "An unexpected error occurred";
    const errorMessage = {
      success: false,
      error: {
        code: status,
        message: message,
        description: description
      }
    };
    return res.status(status).json(errorMessage);
  }
});

//api to get registered events by admin
router.get('/eventResgistrations/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params
    const eventResgistrations = await Register.find({ event: eventId }).populate('event registeredUser', 'email firstName mobileNo dob class college semester department title department isTeam mobNo');
    const successResponse = twohundredResponse({ status: 200, message: "Event Details", data: eventResgistrations, count: eventResgistrations?.length });
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

//api to get stats
router.get('/registrationStats', async (req, res) => {
  try {
    const eventRegistrations = await Register.find().populate('event');
    const bsc = eventRegistrations.filter(registration => registration.event.department === 'BSC').length;
    const cse = eventRegistrations.filter(registration => registration.event.department === 'CSE').length;
    const eee = eventRegistrations.filter(registration => registration.event.department === 'EEE').length;
    const mech = eventRegistrations.filter(registration => registration.event.department === 'MECH').length;
    const civil = eventRegistrations.filter(registration => registration.event.department === 'CIVIL').length;
    const successResponse = twohundredResponse({ status: 200, message: "Registration stats", data: { total: eventRegistrations.length, bsc, cse, eee, mech, civil } });
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


router.get('/test', async (req, res) => {
  try {
    const ids = [
      "662a68fac4d2b5dbff35f340",
      "662a68fac4d2b5dbff35f341",
      "662a68fac4d2b5dbff35f342",
      "662a68fac4d2b5dbff35f343",
      "662a68fac4d2b5dbff35f344",
      "662a68fac4d2b5dbff35f345",
      "662a68fac4d2b5dbff35f346",
      "662a68fac4d2b5dbff35f347",
      "662a68fac4d2b5dbff35f348",
      "662a68fac4d2b5dbff35f349",
      "662a68fac4d2b5dbff35f34a",
      "662a68fac4d2b5dbff35f34b",
      "662a68fac4d2b5dbff35f34c",
      "662a68fac4d2b5dbff35f34d",
      "662a68fac4d2b5dbff35f34e",
      "662a68fac4d2b5dbff35f34f",
      "662a68fac4d2b5dbff35f350",
      "662a68fac4d2b5dbff35f351",
      "662a68fac4d2b5dbff35f352",
      "662a68fac4d2b5dbff35f353",
      "662a68fac4d2b5dbff35f354",
      "662a68fac4d2b5dbff35f355",
      "662a68fac4d2b5dbff35f356",
      "662a68fac4d2b5dbff35f357",
      "662a68fac4d2b5dbff35f358",
      "662a68fac4d2b5dbff35f359",
      "662a68fac4d2b5dbff35f35a",
      "662a68fac4d2b5dbff35f35b",
      "662a68fac4d2b5dbff35f35c",
      "662a68fac4d2b5dbff35f35d",
      "662a68fac4d2b5dbff35f35e"
    ]
    await Question.deleteMany({ _id: { $in: ids } });

    const successResponse = twohundredResponse({ status: 200, message: "Registration stats" });
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
