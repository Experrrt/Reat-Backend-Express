const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const verify = require("../auth/validation");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { registerValidation, loginValidation } = require("../validation");

let token;

router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) {
    console.log(error);
    return res.send({ message: "WE", problem: error.details[0].message });
  }

  const exists = await User.findOne({ email: req.body.email });
  if (exists) return res.send({ message: "WE", problem: "inuse" });

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
  });

  await user
    .save()
    .then((result) => {
      console.log(result);
      //req.session.user = user;
      token = jwt.sign(
        { name: user.name, email: user.email, id: user._id },
        process.env.TOKEN_SECRET,
        { expiresIn: "30m" }
      );
      res.header("auth-token", token).json({
        message: "registered",
        token: token,
        user: { name: user.name, email: user.email, id: user._id },
      });
      // res.send('registered')
    })
    .catch((err) => {
      console.log(err);
      res.status(400);
    });
});

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) {
    console.log(error);
    return res.send({ message: "WE", problem: error.details[0].message });
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.send({ message: "IE", problem: "User not found" });

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass)
    return res.send({ message: "IP", problem: "Incorrect password" });

  //req.session.user = user;

  token = jwt.sign(
    { name: user.name, email: user.email, id: user._id },
    process.env.TOKEN_SECRET,
    { expiresIn: "30m" }
  );
  res.header("auth-token", token).json({
    message: "loggedin",
    token: token,
    user: { name: user.name, email: user.email, id: user._id },
  });
});
//[upload.single("image"), verify]
router.post("/fromdata", [upload.single("image"), verify], async (req, res) => {
  //console.log(req.file.buffer);
  const buff = Buffer.from(req.file.buffer, "utf-8");
  const base64 = buff.toString("base64");
  User.collection
    .updateOne(
      { email: req.user.email },
      {
        $set: {
          img: base64,
        },
      }
    )
    .then((res) => {
      //console.log(res);
    })
    .catch((err) => {
      //console.log(err);
    });
  //console.log(base64);
  const user = await User.findOne({ email: req.user.email });
  res.send(user);
});

router.get("/logged_in", [verify], async (req, res) => {
  //   if (!req.session.user) {
  //     return res.send("not good");
  //   }
  const user = await User.findOne({ email: req.user.email });
  res.json({
    loggedIn: true,
    user: {
      name: req.user.name,
      email: req.user.email,
      _id: req.user._id,
      img: user.img,
    },
  });
});

router.delete("/logout", verify, (req, res) => {
  token = null;
  res.send({ message: "User has been loged out" });
});

router.post("/userFind", (req, res) => {
  User.findById(req.body.id)
    .exec()
    .then((response) => {
      res.send({
        user: {
          img: response.img,
          name: response.name,
        },
      });
    })
    .catch((error) => {
      res.send("DE");
    });
});

router.delete("/", async (req, res) => {
  await User.deleteMany({}).then((result) => {
    console.log(result);
  });
});

module.exports = router;
