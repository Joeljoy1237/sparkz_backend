const mongoose = require("mongoose");
const moment = require("moment");

const testQuestionSchema = new mongoose.Schema({
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

testQuestionSchema.set("toJSON", {
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

testQuestionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const TestQuestion = mongoose.model("TEST_Question", testQuestionSchema);

module.exports = TestQuestion;
