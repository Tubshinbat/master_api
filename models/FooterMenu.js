const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const FooterMenuSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  cover: {
    type: String,
  },

  isDirect: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  isModel: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  name: {
    type: String,
  },

  direct: {
    type: String,
  },

  picture: {
    type: String,
  },

  slug: {
    type: String,
  },

  parentId: {
    type: String,
  },

  model: {
    type: String,
    enum: ["news", "members", "companys", "faqs", "contacts"],
  },

  position: {
    type: Number,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },

  updateAt: {
    type: Date,
    default: Date.now,
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

module.exports = mongoose.model("FooterMenu", FooterMenuSchema);
