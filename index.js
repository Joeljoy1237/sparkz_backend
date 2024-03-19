const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/user");
const eventRoute = require("./routes/event");
const connectToDB = require("./utils/database");

connectToDB();

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// const connectDb = () => {
//     mongoose
//         .connect(
//             process.env.MONGO_URL)
//         .then((res) => {
//             console.log("MONGODB CONNECTED SUCCESSFULLY !!!");
//         })
//         .catch((err) => {
//             console.log("Mongodb error: ", err);
//         });
// };

app.use("/api/v1/user", userRoute);
app.use("/api/v1/event", eventRoute);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/api/v2/", (req, res) => {
  return res.status(200).json({
    resCode: 200,
    status: "SUCCESS",
    message: "Backend application of Sparkz ccet",
  });
});

// const connectDb = () => {
//     mongoose
//         .connect(
//             process.env.MONGO_URL)
//         .then((res) => {
//             console.log("MONGODB CONNECTED SUCCESSFULLY !!!");
//         })
//         .catch((err) => {
//             console.log("Mongodb error: ", err);
//         });
// };

app.listen(process.env.PORT, async () => {
  // connectDb();
  console.log(`Server started listening at port ${process.env.PORT}`);
});
