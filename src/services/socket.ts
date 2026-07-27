import { Server } from "socket.io";

let io: Server;

export function setSocket(server: Server) {
  io = server;
}

export function getSocket() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
}