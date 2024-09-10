import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config(); // Load environment variables from .env file

// MongoDB connection URI from environment variable
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/bazar-isa";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI); // No need for options in Mongoose v6+
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process on failure
  }
};

export default connectDB;
