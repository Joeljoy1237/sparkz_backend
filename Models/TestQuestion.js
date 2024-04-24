const mongoose = require("mongoose");
const moment = require("moment");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
  },
  a: {
    type: String
  },
  b: {
    type: String
  },
  c: {
    type: String
  },
  d: {
    type: String
  },
  e: {
    type: String
  },
  correct: {
    type: String
  },
  mark: {
    type: Number,
    default: 4
  },
  negativeMark: {
    type: Number,
    default: -1
  },
}, { timestamps: true, versionKey: false });

questionSchema.set("toJSON", {
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

questionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
