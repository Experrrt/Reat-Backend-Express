const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const verify = require("../auth/validation");
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

  user
    .save()
    .then((result) => {
      console.log(result);
      //req.session.user = user;
      token = jwt.sign(
        { name: user.name, email: user.email, id: user._id },
        process.env.TOKEN_SECRET,
        { expiresIn: "30m" }
      );
      res.header("authtoken", token).json({
        message: "registered",
        token: token,
        user: { name: user.name, email: user.email, id: user._id },
      });
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

  token = jwt.sign(
    { name: user.name, email: user.email, id: user._id },
    process.env.TOKEN_SECRET,
    { expiresIn: "30m" }
  );
  res.header("authtoken", token).json({
    message: "loggedin",
    token: token,
    user: { name: user.name, email: user.email, id: user._id },
  });
});

router.get("/logged_in", [verify], async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  console.log(user);
  res.json({
    loggedIn: true,
    user: {
      name: req.user.name,
      email: req.user.email,
      id: req.user.id,
      img: user.img,
      dac: user.dac,
      friends: user.friends,
      friendRequests: user.friendRequests,
    },
  });
});

router.delete("/logout", verify, (req, res) => {
  token = null;
  res.send({ message: "User has been loged out" });
});

module.exports = router;
