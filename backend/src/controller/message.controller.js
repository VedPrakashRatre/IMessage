import  User  from "../models/User.js";
import Message from "../models/Message.js"
import { hasImageKitConfig, uploadChatMedia } from "../libs/imagekit.js";
import { getReceiverSocketId, io } from "../libs/socket.js";


export async function getUsersForSidebar(req,res){
    try {
        const loggedInUserId = req.user._id;
        const filterUsers = await User.find({_id:{$ne:loggedInUserId}}).select("-clerkId");
        res.status(200).json(filterUsers);

    } catch (error) {
        console.error("Error in getUsersForSidebar :" , error.message);
        res.status(500).json({message: "Internal Server Error"});        
    }
}

export async function getConversationsForSidebar(req,res) {
    try {
        const loggedUserId = req.user._id;

      const conversation = await Message.aggregate([
        { $match: {$or :[{ senderId:loggedUserId} , { receiverId:loggedUserId }]}},

        // $cond was using an invalid operator ($ep) and the $lookup pointed at a
        // non-existent "start" collection; both are fixed here.
        {$group: {_id:{$cond:[{$eq: ["$senderId" , loggedUserId]} , "$receiverId" , "$senderId" ]},
        lastMessageAt:{$max : "$createdAt"},
        },
    },
     {$sort: {lastMessageAt: -1 }},

     {$lookup : {from: "users" , localField: "_id" , foreignField: "_id" , as: "user"}},

     // Skip conversations whose peer user no longer exists (e.g. deleted by the Clerk webhook),
     // otherwise $replaceRoot would crash on an empty $first.
     {$match : {"user.0" : {$exists: true}}},

     {$replaceRoot: {newRoot :{$first : "$user"}}},

     {$project : {clerkId : 0}},
       ])
      res.status(200).json(conversation);
    } catch (error) {
        console.error("Error in getConversationsForSidebar : " , error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
    
}

export async function getMessages(req,res) {
    try{
        const {id:userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId:myId , receiverId:userToChatId},
                {senderId:userToChatId , receiverId:myId}
            ]
        }).sort({createdAt:1});
        res.status(200).json(messages);
    }
    catch (error) {
        console.error("Error in getMessages : " , error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
    
}

export async function sendMessages(req,res) {
    try {
        const {text} = req.body;
        const {id:receiverId} = req.params;
        const senderId = req.user._id;

        // A message needs either text or a media file (text-only messages sent
        // FormData-free JSON, so req.file is undefined in that case).
        if(!text && !req.file){
            return res.status(400).json({message: "Message content is required"});
        }

        if(req.file && !hasImageKitConfig()){
            return res.status(400).json({message: "ImageKit configuration is missing"});
        }

        let imageUrl;
        let videoUrl;

        // Only upload when a file was actually sent.
        if(req.file){
            const url = await uploadChatMedia(req.file)
            if(req.file.mimetype.startsWith("video/")) videoUrl = url;
            else imageUrl = url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
            video:videoUrl,
        });
        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);

        //only send the message to the user if they are online
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage" , newMessage);
        }

        res.status(201).json(newMessage); 
    } catch (error) {
        console.error("Error in sendMessages : " , error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}
