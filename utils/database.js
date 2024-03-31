const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require('mongodb');
dotenv.config();

const uri = process.env.MONGODB_URL; 
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
module.exports = connectToDB = async () => {
  // mongoose.set("strictQuery", true);
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};
