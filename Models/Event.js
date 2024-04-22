const mongoose = require("mongoose");
const moment = require("moment");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  department: {
    type: String,
    require: true,
  },
  regFee: {
    type: String,
    requried: true,
  },
  firstPrize: {
    type: String,
  },
  secondPrize: {
    type: String,
  },
  thirdPrize: {
    type: String,
  },
  priceCount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  desc: {
    type: String,
  },
  venue: {
    type: String
  },
  rules: [String],
  posterImg: {
    type: String,
    required: true,
  },
  isTeam:{
    type:Boolean,
    default:false
  },
  teamCountMax:{
    type:Number,
    default:0
  },
  teamCountMin:{
    type:Number,
    default:0
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
