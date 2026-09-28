import dns from "dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from 'express'
import "dotenv/config"
import { connectDB } from './libs/db.js';
import User from "./models/User.js"
import { clerkMiddleware } from '@clerk/express'
import cors from "cors"


const app = express();
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware())

app.get('/', (req, res) => {
    res.send('hello world')
})

app.listen(PORT, () => {
    connectDB();
    console.log('server is listening on port 3000...');
});

