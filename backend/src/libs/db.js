import mongoose from "mongoose";
import "dotenv/config";
export async function connectDB(){
    try{
        const mongoUri = process.env.MONGO_URI;

        if(!mongoUri){
            throw new Error("MONGO_URI is required");
        }
        const conn = await mongoose.connect(mongoUri);
        console.log("connected to mongoDB" ,conn.connection.host);

    }
    catch(error){
        console.log("failed to connnect to mongoDB" ,error.message);
        process.exit(1);
    }
}