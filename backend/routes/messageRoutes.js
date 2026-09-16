import express from "express"
import { protectRoute} from "../middleware/auth.js"
import { getMessages, getUserForSidebar, markMessageAsSeen, sendMessage } from "../controllers/messageController.js";


const messageRoute = express.Router();

messageRoute.get("/users",protectRoute,getUserForSidebar);
messageRoute.get("/:id",protectRoute,getMessages);
messageRoute.put("/mark/:id",protectRoute,markMessageAsSeen);
messageRoute.post('/send/:id',protectRoute,sendMessage)

export default messageRoute;