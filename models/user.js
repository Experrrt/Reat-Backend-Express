const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      max: 255,
      min: 6,
    },
    email: {
      type: String,
      required: true,
      max: 255,
      min: 6,
    },
    password: {
      type: String,
      required: true,
      max: 1024,
      min: 6,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    friends: {
      type: Array,
    },
    friendRequests: {
      type: Array,
    },
    img: {
      type: String,
      default: "daco",
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("user", userSchema);
