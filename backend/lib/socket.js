import { Server } from "socket.io";

export const userSocketMap = {};
export let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*" }
    });
    return io;
};
