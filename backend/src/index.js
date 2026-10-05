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
import messageRoutes from "./routes/message.route.js"
import socket from "./libs/socket.js";

const { app, server } = socket;


import fs from "fs";
import path from "path";



const PORT = process.env.PORT;
// Sanitize: the .env value historically had a trailing ";" which broke CORS matching.
const FRONTEND_URL = (process.env.FRONTEND_URL || "").replace(/[;\s]+$/g, "").trim();

const publicDir = path.join(process.cwd() , "public")

// CORS: allow the configured frontend URL plus any local dev server origin
// (Vite's port can vary). In production only the configured origin is allowed.
const allowedOrigins = [FRONTEND_URL].filter(Boolean);
const isDev = process.env.NODE_ENV !== "production";

const corsOrigin = (origin, callback) => {
    // No Origin header = same-origin or non-browser request (curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(origin)) return callback(null, true);
    return callback(null, false);
};

// its important that you don't parse the webhook event data ,it should be in raw format  
app.use("/api/webhooks/clerk" ,express.raw({type:"application/json"}) ,clerkWebhook)

app.use(express.json());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(clerkMiddleware())


app.get('/health', (req, res) => {
    res.send('hello world')
})
// Routers MUST be mounted with app.use so their sub-paths
// (/api/auth/check, /api/messages/users, ...) are actually reachable.
app.use('/api/auth' , authRoutes);
app.use('/api/messages' , messageRoutes);

//if the public directory exists, serve the static files
//this is for the production build

if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir))

    app.get( "/{*any}" , (req,res,next)=>{
        // Never serve the SPA for API routes: a misrouted API request must 404,
        // it must not receive index.html with a 200 (that caused the prod black screen).
        if(req.path.startsWith("/api/")) return res.status(404).json({ message: "Not found" });
        res.sendFile(path.join(publicDir , "index.html") ,(err=> next(err)))
    });

}


server.listen(PORT, () => {
    connectDB();
    console.log('server is listening on port 3000...');

    if(process.env.NODE_ENV === "production"){
        job.start();
    }
});

