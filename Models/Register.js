const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      require: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

const Register = mongoose.model("Register", registerSchema);

module.exports = Register;
