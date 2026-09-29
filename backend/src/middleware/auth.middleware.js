import { getAuth } from "@clerk/express";
import User from "../models/User.js";

export async function protectAuth(req,res,next) {
    try {
        const { userId } = getAuth(req);
        if(!userId){
            res.status(401).json({message:"User Unautherized"});
            return;
        }
        const user = await User.findOne({cherkId:userId});
        if(!user){
            res.status(404).json({message:"User not found"});
            return;
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Error in portectRoute middleware :", error.message);
        res.status(500).json({message:"Internal Server Error"});
        
    }
}