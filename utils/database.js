const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

module.exports = connectToDB = async () => {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(process.env.MANGODB_URL, {
      dbName: "sparkz24",
    });
    isConnected = true;
    console.log("Database Sucessfully connected");
  } catch (error) {
    console.log(error);
  }
};
