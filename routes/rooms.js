const express = require("express");
const router = express.Router();
const verify = require("../auth/validation");
const User = require("../models/user");
const Room = require("../models/chatRoom");
const { ObjectID } = require("mongoose").Types.ObjectId;
const { array } = require("@hapi/joi");

router.post("/joinNewRoom", verify, async (req, res) => {
  let room = "";
  try {
    room = await Room.findById(req.body.roomID);
  } catch (err) {
    res.send({ message: "NF" });
    return;
  }
  if (room.users.find((e) => e == req.user.id) !== undefined) {
    res.send({ message: "AJ" });
    return;
  }
  await Room.updateOne(
    { _id: ObjectID.createFromHexString(req.body.roomID) },
    {
      $push: {
        users: req.user.id,
      },
    }
  );
  await User.updateOne(
    { _id: ObjectID.createFromHexString(req.user.id) },
    {
      $push: {
        rooms: req.body.roomID,
      },
    }
  );
  res.send({ message: "RJ", id: req.body.roomID });
});

router.post("/createRoom", verify, async (req, res) => {
  let room = "";
  try {
    room = await new Room({
      name: req.body.name,
      users: req.user.id,
    }).save();
  } catch (err) {
    res.send("ER");
    return;
  }
  User.updateOne(
    { _id: ObjectID.createFromHexString(req.user.id) },
    {
      $push: {
        rooms: String(room._id),
      },
    }
  )
    .then(() => {
      res.send("RC");
    })
    .catch(() => {
      res.send("ER");
    });
});

router.post("/loadRooms", verify, async (req, res) => {
  Room.find({
    _id: {
      $in: req.body.id,
    },
  })
    .then((reponse) => {
      const map = reponse.map((x) => {
        return {
          name: x.name,
          id: x._id,
        };
      });
      res.send(map);
    })
    .catch(() => {
      res.send({ message: "DE" });
    });
});

// router.get("/getUsersRooms", verify, async (req, res) => {
//   let user = "";
//   try {
//     user = await User.findById(req.user.id);
//   } catch (err) {
//     return;
//   }
//   res.send(user.rooms);
// });

router.post("/getRoomContent", verify, async (req, res) => {
  const room = await Room.findById(req.body.id);
  let lastIndex;

  if (room.messages.length < 20) {
    lastIndex = 0;
  } else {
    lastIndex = room.messages.length - 20;
  }

  res.send({
    messages:
      room.messages.length < 20
        ? room.messages.slice(lastIndex, room.messages.length)
        : room.messages.slice(lastIndex, lastIndex + 20),
    messagesLength: room.messages.length,
    users: room.users,
  });
});

router.post("/loadMoreMsgs", verify, async (req, res) => {
  const room = await Room.findById(req.body.id);
  let lastIndex;
  if (room.messages.length + 20 <= req.body.index) {
    res.status(400);
    return;
  }
  if (room.messages.length < req.body.index) {
    lastIndex = 0;
  } else {
    lastIndex = room.messages.length - req.body.index;
  }
  console.log(room.messages.length);
  console.log(req.body.index);

  if (room.messages.length < req.body.index) {
    // console.log(room.messages.slice(lastIndex, lastIndex + 20));
  }
  res.send({
    messages:
      room.messages.length < req.body.index
        ? room.messages.slice(
            lastIndex,
            room.messages.length - req.body.index + 20
          )
        : room.messages.slice(lastIndex, lastIndex + 20),
  });
});

module.exports = router;
