const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    require: true,
  },
  price: {
    reg: {
      type: Number,
      requried: true,
    },
    first: {
      type: Number,
      required: true,
    },
    second: {
      type: Number,
    },
    third: {
      type: Number,
    },
  },
  priceCount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  rules: [String],
  posterImg: {
    type: String,
    required: true,
  },
  cordinator: [
    {
      name: {
        type: String,
        required: true,
      },
      contact: {
        type: String,
        required: true,
      },
    },
  ],
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
