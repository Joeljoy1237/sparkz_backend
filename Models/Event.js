const mongoose = require("mongoose");
const moment = require("moment");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    require: true,
  },
  regFee: {
    type: Number,
    requried: true,
  },
  price: {
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
}, { timestamps: true, versionKey: false });

eventSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    const createdAt = moment(ret.createdAt);
    const updatedAt = moment(ret.updatedAt);

    const now = moment();
    const createdAgo = createdAt.from(now);
    const updatedAgo = updatedAt.from(now);

    ret.createdAt = {
      date: createdAt.format("DD/MM/YYYY , HH:mm"),
      ago: createdAgo,
    };

    ret.updatedAt = {
      date: updatedAt.format("DD/MM/YYYY , HH:mm"),
      ago: updatedAgo,
    };

    return ret;
  },
});

eventSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
