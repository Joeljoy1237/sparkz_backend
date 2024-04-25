const express = require("express");
const router = express.Router();
const Event = require("../Models/Event");
const { customError, twoNotOneResponse, twohundredResponse } = require("../utils/Helpers");
const Register = require("../Models/Register");

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
    const eventResgistrations = await Register.find({ event: eventId }).populate('event registeredUser', 'email firstName mobileNo mobNo dob class college semester department title department isTeam');
    const successResponse = twohundredResponse({ status: 200, message: "Event Details", data: eventResgistrations,count:eventResgistrations?.length });
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
