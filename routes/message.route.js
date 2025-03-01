import express from 'express';

import { getUsersForSidebar,getMessagesList,sendMessages } from '../controllers/message.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const MessageRoute = express.Router()

MessageRoute.get('/',protectRoute,getUsersForSidebar);
MessageRoute.get('/:id',protectRoute,getMessagesList);  // id of the other user who is chatting with me 
MessageRoute.post('/send/:id',protectRoute,sendMessages);

export {MessageRoute}