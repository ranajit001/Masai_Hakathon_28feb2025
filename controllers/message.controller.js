import mongoose from "mongoose";
import { UserModel } from "../models/user.model.js";
import messageModel from "../models/message.model.js";
import cloudinary from "../configs/cloudinary.js";


const getUsersForSidebar = async(req,res)=>{
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await UserModel.find({_id:{$ne:loggedInUserId}}).select('-password') ; // all users except me.. without password
            res.status(200).send(filteredUsers);
    } catch (error) {
        console.log('error in message route=> get usersidebar function ',error);
        res.status(400).send('server error');
        
    }
};

const getMessagesList = async(req,res)=>{
    try{
        const myId = req.user._id;  //logged in user id 
        const otheruserId = req.params.id;  //other user id 

        const messages = await messageModel.find({
            $or:[
                {senderId:otheruserId,reciverId:myId}, // all messages where sender is other one and reiver is me or 
                {reciverId:otheruserId,senderId:myId}  // render is me and reciver is other one
            ]
        });
        res.status(200).send(messages)
    }
    catch(e){
        console.log(' error from getMessagesList function',e);
        res.status(500).send('server error')
    }

}


const sendMessages = async (req,res) => {
    try {
        const{text,image} = req.body;
        const other_personId_whome_i_wantTo_send_Message = req.params.id;
        const my_id = req.user._id;

        let imageurl;
        if(image){
            //if image available upload the image to loudinary and save the image link to imageurl valiable...
            const uploadResponse = await cloudinary.uploader.upload(image);
            const imageurl = uploadResponse.secure_url;
        };

        const newMessage = new messageModel(
                {  senderId: my_id,
                  reciverId:other_personId_whome_i_wantTo_send_Message,
                  text,
                  image:imageurl});

            await newMessage.save();

            // ****************************************************

                        // socker.io



            // *******************************************************

            res.status(201).send(newMessage)
    

    }     catch(e){
        console.log(' error from sendMessage function',e);
        res.status(500).send('server error')
    }
}


export{getUsersForSidebar,getMessagesList,sendMessages}