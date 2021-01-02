const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const emails = require("../models/email");
const dotenv = require("dotenv");
const { emailValidation } = require("../validation");

dotenv.config();

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "marcekland@gmail.com",
    pass: process.env.PAS_EMAIL,
  },
});

function sendConfirm(user) {
  transporter.sendMail(
    {
      from: "marcekland@gmail.com",
      to: user,
      subject: "THX",
      text: "Bla bla bla",
    },
    function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent: ", info.response);
      }
    }
  );
}

function send() {
  emails
    .find({})
    .exec()
    .then((email) => {
      for (let i = 0; i < email.length; i++) {
        transporter.sendMail(
          {
            from: "marcekland@gmail.com",
            to: email[i].email,
            subject: "Node js test email",
            text: "Bla bla bla",
          },
          function (err, info) {
            if (err) {
              console.log(err);
            } else {
              console.log("Email sent: ", info.response);
            }
          }
        );
      }
    });
}

router.post("/newsletter", async (req, res) => {
  const { error } = emailValidation(req.body);
  if (error) {
    console.log(error);
    return res.send(error.details[0].message);
  }

  const exists = await emails.findOne({ email: req.body.email });
  if (exists) return res.send("inuse");

  const email = new emails({
    email: req.body.email,
  });

  await email
    .save()
    .then((result) => {
      sendConfirm(email.email);
      res.send("registered");
    })
    .catch((err) => {
      console.log(err);
      res.send(err.message);
    });
});

router.delete("/", (req, res, next) => {
  emails
    .deleteMany({})
    .exec()
    .then((result) => {
      res.status(200).json(result);
    });
});

module.exports = router;
