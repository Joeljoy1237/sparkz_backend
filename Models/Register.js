const mongoose = require("mongoose");
const moment = require("moment");

const registerSchema = new mongoose.Schema(
  {
    registeredUser: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    event: {
      type: mongoose.Types.ObjectId,
      ref: "Event",
    },
    team: [
      {
        studentName: {
          type: String
        },
        category:{
          type:String
        },
        class: {
          type: String
        },
        school: {
          type: String
        },
        schoolAddress: {
          type: String
        },
        email: {
          type: String
        },
        mobNo: {
          type: Number
        },
        semester: {
          type: String
        },
        college: {
          type: String
        },
      }
    ]
  },
  { timestamps: true, versionKey: false }
);

registerSchema.set("toJSON", {
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

registerSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Register = mongoose.model("Register", registerSchema);

module.exports = Register;
