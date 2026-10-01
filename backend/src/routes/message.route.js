import express from "express";
import { getConversationsForSidebar, getMessages, getUsersForSidebar } from "../controller/message.controller.js";
import { protectAuth } from "../middleware/auth.middleware.js";
import { sendMessages } from "../controller/message.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();
router.use(protectAuth);
router.get('/users', getUsersForSidebar)
router.get('/conversation', getConversationsForSidebar)
router.get('/:id', getMessages);
router.post('/send/:id', upload.single('media'), sendMessages);

export default router;