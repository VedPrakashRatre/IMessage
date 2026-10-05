import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
const FRONTEND_URL = (process.env.FRONTEND_URL || "").replace(/[;\s]+$/g, "").trim();
const app = express();
const server = http.createServer(app);

// When FRONTEND_URL is not set (e.g. the production monolith where the page and
// API live on the same origin), allow any origin instead of blocking everything
// with `origin: [undefined]`.
const corsOrigin = FRONTEND_URL ? [FRONTEND_URL] : true;

const io = new Server(server, { cors: { origin: corsOrigin } });

export const getReceiverSocketId = (userId) => {
    return userSocketMap[userId];
};

//online user map  = {userId: socketId}
const userSocketMap = {};

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;
    console.log(`User connected: ${userId}`);
    //io.emit() sends event to everyone connected to the server - broadcast
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    //socket.on is used to listen to events
    socket.on('disconnect', () => {
        if(userId) delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io };
export default { app ,io, server};
