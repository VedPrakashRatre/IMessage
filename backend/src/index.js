import dns from "dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from 'express'
import "dotenv/config"
import { connectDB } from './libs/db.js';
import User from "./models/User.js"
import { clerkMiddleware } from '@clerk/express'
import cors from "cors"
import job from "./libs/cron.js"
import clerkWebhook from "./webhooks/clerk.webhook.js"
import authRoutes from "./routes/auth.route.js"

import fs from "fs";
import path from "path";


const app = express();
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

const publicDir = path.join(process.cwd() , "public")

// its important that you don't parse the webhook event data ,it should be in raw format  
app.use("/api/webhooks/clerk" ,express.raw({type:"application/json"}) ,clerkWebhook)

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware())


app.get('/heath', (req, res) => {
    res.send('hello world')
})
app.get('/api/auth' , authRoutes);

//if the public directly exist,serve the static file
//this is for the production build

if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir))

    app.get( "/{*any}" , (req,res,next)=>{
        res.sendFile(path.join(publicDir , "index.html") ,(err=> next(err)))
    });

}


app.listen(PORT, () => {
    connectDB();
    console.log('server is listening on port 3000...');

    if(process.env.NODE_ENV === "production"){
        job.start();
    }
});

