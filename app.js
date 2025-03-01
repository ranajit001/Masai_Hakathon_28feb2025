import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from "./configs/mongodb.config.js";
import UserRouter from "./routes/user.route.js";
import { MessageRoute } from "./routes/message.route.js";



const app = express();


app.use(express.json());
app.use(cors())


app.use('/users',UserRouter);
app.use('/message',MessageRoute);







const PORT = process.env.PORT || 5000;


app.listen(+PORT,async () => {
    await connectDB();
    console.log('server started...');
    
})
