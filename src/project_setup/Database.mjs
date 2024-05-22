//src/project_setup/Database.mjs
import 'dotenv/config';
import mongoose from "mongoose";

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connection successful");
    } catch (error) {
        console.error("Error connecting to the database:");
        console.error(error);
        process.exit(1);
    }
};

export default connectToDatabase;
