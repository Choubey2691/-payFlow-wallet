const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/payment-app";
    console.log("DEBUG - Loaded MONGO_URI:", process.env.MONGO_URI ? "Found Atlas URI" : "UNDEFINED (Falling back to localhost)");
    await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected Successfully: ${mongoose.connection.host}`);
  } catch (error) {
    console.log("DB Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;