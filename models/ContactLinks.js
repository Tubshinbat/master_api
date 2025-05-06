const mongoose = require("mongoose");

const defaultRules = {
  required: [true, "Заавал бөглөх талбаруудыг дутуу бөглөсөн байна."],
  trim: true,
};

const ContactLinksSchema = new mongoose.Schema({
  name: {
    type: String,
    ...defaultRules,
  },

  link: {
    type: String,
    ...defaultRules,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },

  updateAt: {
    type: Date,
    default: Date.now,
  },

  pkey: {
    type: mongoose.Schema.ObjectId,
    ref: "Members",
  },

  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("ContactLinks", ContactLinksSchema);
