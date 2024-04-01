const express = require("express");
const router = express.Router();
const Event = require("../Models/Event");
const { customError, twoNotOneResponse } = require("../utils/Helpers");

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
      venue: data.venue,
      rules: data.rules,
      posterImg: data.posterImg,
      cordinator: data.cordinator,
    });

    await event.save();
    const successResponse = {
      success: true,
      message: "Event created successfully",
      event: event // Optionally, send back the created event
    };
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


module.exports = router;
