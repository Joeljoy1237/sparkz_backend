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

registerSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    const createdAt = moment(ret.createdAt);
    const updatedAt = moment(ret.updatedAt);

    const now = moment();
    const createdAgo = createdAt.from(now);
    const updatedAgo = updatedAt.from(now);

    ret.createdAt = {
      date: createdAt.format('DD/MM/YYYY , HH:mm'),
      ago: createdAgo
    };

    ret.updatedAt = {
      date: updatedAt.format('DD/MM/YYYY , HH:mm'),
      ago: updatedAgo
    };

    return ret;
  }
});

registerSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Register = mongoose.model("Register", registerSchema);

module.exports = Register;
