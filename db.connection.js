import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();

const connectDB = async () => {
  try {
    // Access environment variables using process.env
    const dbName = process.env.DB_NAME;
    const dbUserName = encodeURIComponent(process.env.DB_USERNAME);
    const dbPassword = encodeURIComponent(process.env.DB_PASSWORD);
    const dbHost = process.env.DB_HOST;
    const dbOptions = process.env.DB_OPTIONS;

    // Create the MongoDB connection URL
    const url = `mongodb+srv://${dbUserName}:${dbPassword}@${dbHost}/${dbName}?${dbOptions}`;

    // Connect to MongoDB
    await mongoose.connect(url);

    console.log("DB connection established...");
  } catch (error) {
    console.log("DB Connection failed...");
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDB;
