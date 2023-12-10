const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const PartnerSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  slug: String,

  name: {
    type: String,
    trim: true,
    required: [true, "Хамтрагч компанийн нэрийг оруулна уу"],
  },

  about: {
    type: String,
    trim: true,
    required: [true, "Дэлгэрэнгүй мэдээллийг оруулна уу"],
  },

  links: { type: String },

  category: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "MemberCategories",
    },
  ],

  cover: {
    type: String,
  },

  logo: {
    type: String,
  },

  lat: {
    type: String,
    default: "47.91913589111381",
  },

  long: {
    type: String,
    default: "106.91757790656888",
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

module.exports = mongoose.model("Partner", PartnerSchema);
