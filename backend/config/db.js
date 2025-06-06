import mongoose from "mongoose";
import config from "./index.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI, {
      // useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+
      // useCreateIndex and useFindAndModify are also deprecated.
    });
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
