const express = require("express");
const router = express.Router();

const User = require("../models/user");
const verify = require("../auth/validation");
const multer = require("multer");
const { ObjectID } = require("mongoose").Types.ObjectId;
const upload = multer({ storage: multer.memoryStorage() });

router.post("/fromdata", [upload.array("files"), verify], async (req, res) => {
  let model = { name: req.body.name, desc: req.body.desc };
  if (req.files[0] != null && req.body.type == "b") {
    const base641 = Buffer.from(req.files[0].buffer, "utf-8").toString(
      "base64"
    );
    model = {
      imgBack: base641,
      name: req.body.name,
      desc: req.body.desc,
    };
  } else if (req.files[0] != null && req.body.type == "p") {
    const base642 = Buffer.from(req.files[0].buffer, "utf-8").toString(
      "base64"
    );
    model = {
      img: base642,
      name: req.body.name,
      desc: req.body.desc,
    };
  } else if (
    req.files[1] != null &&
    req.files[0] != null &&
    req.body.type == "pb"
  ) {
    const base641 = Buffer.from(req.files[0].buffer, "utf-8").toString(
      "base64"
    );
    const base642 = Buffer.from(req.files[1].buffer, "utf-8").toString(
      "base64"
    );
    model = {
      imgBack: base641,
      img: base642,
      name: req.body.name,
      desc: req.body.desc,
    };
  }
  User.collection
    .updateOne(
      { _id: ObjectID.createFromHexString(req.user.id) },
      {
        $set: model,
      }
    )
    .then(() => {
      res.send("SUCC");
    })
    .catch(() => {
      res.send("ERR");
    });
});

router.get("/test", async (req, res) => {
  // User.updateOne(
  //   { _id: ObjectID.createFromHexString("5fedc7e0b6cca617d6c5d949") },
  //   {
  //     $set: {
  //       friendRequests: ["a", "b"],
  //     },
  //   }
  // ).then((Response) => {
  const user = await User.findById("5fedc7e0b6cca617d6c5d949");
  let list = user.friendRequests;
  console.log(list.find((element) => element == "a"));
  if (list.find((element) => element == "") !== undefined) {
    console.log("ano");
  }
  list.push("c");
  // list = arrayRemove(list, "c");
  console.log(list.push("c"));
  // console.log(found);
  // });
});

router.post("/userFind", (req, res) => {
  User.findById(req.body.id)
    .exec()
    .then((response) => {
      res.send({
        user: {
          img: response.img,
          name: response.name,
          id: response._id,
        },
      });
    })
    .catch(() => {
      res.send("DE");
    });
});
router.post("/userFindMany", (req, res) => {
  User.find({
    _id: {
      $in: req.body.id,
    },
  })
    .then((reponse) => {
      const map = reponse.map((x) => {
        return {
          user: {
            img: x.img,
            name: x.name,
            id: x._id,
          },
        };
      });
      res.send(map);
    })
    .catch(() => {
      res.send({ message: "DE" });
    });
});

router.post("/sendFriendRequest", verify, async (req, res) => {
  let userR = "";
  let userA = "";
  try {
    userR = await User.findOne({
      _id: ObjectID.createFromHexString(req.user.id),
    });
    userA = await User.findOne({
      _id: ObjectID.createFromHexString(req.body.friend),
    });
  } catch (error) {
    return res.send({ message: "DE" });
  }
  if (
    userA.friends.find((e) => e == req.user.id) !== undefined ||
    userR.friends.find((e) => e == req.body.friend) !== undefined
  ) {
    return res.send({ message: "AF" });
  }
  if (userA.friendRequests.find((e) => e == req.user.id) !== undefined)
    return res.send({ message: "AS" });
  if (userR.friendRequests.find((e) => e == req.body.friend) !== undefined) {
    makeFriends(req.user.id, req.body.friend, userR, userA).then((response) => {
      res.send({ message: response });
    });
    return;
  }
  userA.friendRequests.push(req.user.id);
  User.collection
    .updateOne(
      { _id: ObjectID.createFromHexString(req.body.friend) },
      {
        $set: {
          friendRequests: userA.friendRequests,
        },
      }
    )
    .then(() => {
      res.send({ message: "SUCC" });
    })
    .catch(() => {
      res.send({ message: "DE" });
    });
});

router.post("/acceptFriendRequst", verify, async (req, res) => {
  let userR = "";
  let userA = "";
  try {
    userR = await User.findOne({
      _id: ObjectID.createFromHexString(req.user.id),
    });
    userA = await User.findOne({
      _id: ObjectID.createFromHexString(req.body.friend),
    });
  } catch (error) {
    return res.send({ message: "DE" });
  }
  makeFriends(req.user.id, req.body.friend, userR, userA).then((response) => {
    //res.send("ano");
    res.send(response);
  });
});

// router.post("/addFriend", verify, async (req, res) => {
//   const userR = await User.findOne({
//     _id: ObjectID.createFromHexString(req.user.id),
//   });
//   const userA = await User.findOne({
//     _id: ObjectID.createFromHexString(req.body.friend),
//   });
//   if (!userA || !userR) return res.send({ message: "NF" });
//   if (userA.friends == req.user.id || userR.friends == req.body.friend)
//     return res.send({ message: "AF" });
//   User.collection
//     .updateOne(
//       { _id: ObjectID.createFromHexString(req.user.id) },
//       {
//         $set: {
//           friends: req.body.friend,
//         },
//       }
//     )
//     .then(() => {
//       res.send("SUCC");
//     });
// });

router.delete("/deleteAll", async (req, res) => {
  await User.deleteMany({}).then((result) => {
    console.log(result);
  });
});

async function makeFriends(IDR, IDA, userR, userA) {
  try {
    userR.friends.push(IDA);
    userA.friends.push(IDR);

    await User.collection.updateOne(
      { _id: ObjectID.createFromHexString(IDR) },
      {
        $set: {
          friends: userR.friends,
          friendRequests: arrayRemove(userR.friendRequests, IDA),
        },
      }
    );
    await User.collection.updateOne(
      { _id: ObjectID.createFromHexString(IDA) },
      {
        $set: {
          friends: userA.friends,
        },
      }
    );
    return "SUCC";
  } catch (error) {
    console.log(error);
    return "DE";
  }
}

function arrayRemove(arr, value) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}

module.exports = router;
