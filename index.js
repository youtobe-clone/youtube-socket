import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

const app = express();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 5000;

let users = [];

app.get("/", (req, res) => {
  res.send("Hello socket server");
});

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

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
    const client = users.filter((item) => user.includes(item._id));

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
