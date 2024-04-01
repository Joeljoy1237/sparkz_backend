const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

module.exports = connectDb = () => {
  mongoose
    .connect(
      process.env.MONGODB_URL)
    .then((res) => {
      console.log("MONGODB CONNECTED SUCCESSFULLY !!!");
    })
    .catch((err) => {
      console.log("Mongodb error: ", err);
    });
};
