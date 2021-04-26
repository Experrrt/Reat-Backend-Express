const express = require("express");
const router = express.Router();
const app = require("../app");
const io = app.get("io");
const moment = require("moment");
const Room = require("../models/chatRoom");
const {
  addUser,
  getUser,
  userLeave,
  getUsers,
} = require("../utils/handleUsers");
const { ObjectID } = require("mongoose").Types.ObjectId;

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ name, room, _id, img, last }) => {
    addUser(socket.id, name, room, _id, img);

    console.log("New connection");
    console.log("Joinded room: " + room);

    socket.leave(last);
    socket.broadcast.to(last).emit("allertMessage", {
      message: name + " stopped viewing chat",
    });

    socket.join(room);
    socket.emit("allertMessage", {
      message: "Welcome " + name,
    });
    socket.broadcast.to(room).emit("allertMessage", {
      message: name + " started viewing chat",
      // joinedUsers: [{ user: { name: name, id: _id, img: img } }],
    });
  });

  socket.on("disconnect", () => {
    const leaver = userLeave(socket.id);
    if (!leaver) return;
    console.log("Leaver id:" + leaver.name);
    socket.broadcast.to(leaver.room).emit("allertMessage", {
      message: leaver.name + " stopped viewing chat",
    });
  });

  socket.on("chatMessage", (msg) => {
    console.log("Message emmited to socket:" + socket.id);
    const currentUser = getUser(socket.id);
    if (!currentUser) {
      console.log("No user");
      return;
    }
    console.log("message");
    console.log(currentUser.name);
    console.log(currentUser.room);

    let date = moment().format("ll") + " " + moment().format("LT");
    date = date.split(" ");
    date.splice(2, 1);
    date = date.join(" ");
    Room.collection
      .updateOne(
        { _id: ObjectID.createFromHexString(currentUser.room) },
        {
          $push: {
            messages: {
              msg: msg,
              name: currentUser.name,
              id: currentUser.id,
              _id: currentUser._id,
              time: date,
            },
          },
        }
      )
      .then(() => {
        io.to(currentUser.room).emit("message", {
          msg: msg,
          name: currentUser.name,
          id: currentUser.id,
          time: date,
          _id: currentUser._id,
        });
      });
  });
});
module.exports = router;
