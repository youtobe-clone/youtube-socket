import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONT_END_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 5000;

let users = [];

app.get("/", (req, res) => {
  res.send("Hello socket server");
});

io.on("connection", (socket) => {
  // on user connection
  socket.on("new-connection", (user) => {
    users.push({ ...user, socketId: socket.id });
    io.emit("return-users", users);
  });

  // on user disconnect
  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("return-users", users);
  });

  // on user create new notification
  socket.on("create-new-notification", (response) => {
    const user = response?.notification?.user;
    const client = users.filter((item) => user.includes(item?.data?._id));
    console.log("users:", users);
    console.log("user array:", user);
    console.log("client:", client);
    if (client.length > 0) {
      client.forEach((item) => {
        socket
          .to(item.socketId)
          .emit("new-notification", response?.notification);
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(
    `⚡️[server]: Server  socket is running at http://localhost:${PORT}`
  );
});
