import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
      senderId:{type:mongoose.Types.ObjectId,ref:'User',required:true},
      reciverId:{type:mongoose.Types.ObjectId,ref:'User',required:true},
      text:String,
      image:String
  },
  { timestamps: true }
);
const messageModel =  mongoose.model("Message", messageSchema);
export default messageModel;
