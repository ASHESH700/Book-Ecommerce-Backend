import mongoose from "mongoose";

const dbName = "book";
const dbUserName = "Ashesh";
const dbPassword = encodeURIComponent("Hello");
const dbHost = "school.gl3ovph.mongodb.net";
const dbOptions = "retryWrites=true&w=majority&appName=School";

const connectDB = async () => {
  try {
    const url = `mongodb+srv://${dbUserName}:${dbPassword}@${dbHost}/${dbName}?${dbOptions}`;

    await mongoose.connect(url);

    console.log("DB connection established...");
  } catch (error) {
    console.log("DB Connection failed...");
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDB;
