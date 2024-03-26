const express = require("express");
const router = express.Router();
const Event = require("../Models/Event");

router.post("/new", (req, res) => {
  try {
    const data = { ...req.body };
    const event = new Event({
      title: data.title,
      department: data.department,
      regFee:data.regFee,
      price: {
        first: data.price.first,
        second: data.price.second,
        third: data.price.third,
      },
      priceCount: data.priceCount,
      type: data.type,
      date: data.date,
      time: data.time,
      desc: data.desc,
      rules: data.rules,
      posterImg: data.posterImg,
      cordinator: data.cordinator,
    });
    event.save();
    console.log(data.title);
    return res.status(201).json({ status: "ok" });
  } catch (err) {
    console.log(err);
    return res.status(500);
  }
});

module.exports = router;
