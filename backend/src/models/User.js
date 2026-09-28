import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    clerkId:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    fullname:{
        type:String,
        required:true,
    },
    profilepic:{
        type:String,
        default:"",
    }
})
const User = mongoose.model("User" ,UserSchema );

export default User;