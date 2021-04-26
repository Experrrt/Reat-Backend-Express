const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    messages: {
      type: Array,
    },
    users: {
      type: Array,
    },
    name: {
      type: String,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("chatRooms", chatSchema);
