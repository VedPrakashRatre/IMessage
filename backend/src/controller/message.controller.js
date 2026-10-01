import  User  from "../models/User.js";
import Message from "../models/Message.js"
import hasImageKitConfig from "../libs/imagekit.js";

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
        { $match: {$or :[{ senderId:loggedInUserId} , { receiverId:loggedInUserId }]}},

        {$group: {_id:{$cond:[{$ep: ["senderId" , loggedInUserId]} , "receiverId" , "$senderId" ]},
        lastMessageAt:{$max : "$createdAt"},
        },
    },
     {$sort: {lastMessageAt: -1 }},

     {$lookup : {from: "start" , localField: "_id" , foreignField: "_id" , as: "user"}},

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

        let imageUrl;
        let videoUrl;

        if(!hasImageKitConfig()){
            return res.status(400).json({message: "ImageKit configuration is missing"});
        }
       const url = await uploadChatMedia(req.file)
       if(req.file.memetype.startWith("video/")) videoUrl = url;
         else imageUrl = url;

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
            video:videoUrl,
        });
        await newMessage.save();
        res.status(201).json(newMessage); 
    } catch (error) {
        console.error("Error in sendMessages : " , error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}