import mongoose from "mongoose";
import dotenv from 'dotenv'


dotenv.config({
  path: "./config/.env",
});


export const connectDatabase = async() => {
  try{
   await  mongoose.connect(process.env.MONGODB_URL, {
      dbName: "Matching_Order", // MongoDB database name
    })
     console.log("Matching_Order solution database connected.")
  }catch(err){
    console.error('Error connecting to MongoDB',err);
    process.exit(1);
  }
};