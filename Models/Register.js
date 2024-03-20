const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema(
  {
    registeredUserId: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    eventId: {
      type: mongoose.Types.ObjectId,
      ref: 'Event'
    },
    eventName: {
      type: String,
      required: true,
    },
    conductedBy: {
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
