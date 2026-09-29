import express from "express"
import { checkAuth } from "../controller/auth.controller.js";
import { protectAuth } from "../middleware/auth.middleware.js";
const router = express.Router();


router.get('/check' ,protectAuth, checkAuth);


export default router;