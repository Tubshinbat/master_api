const mongoose = require("mongoose");

const defaultRules = {
  required: [true, "Заавал бөглөх талбаруудыг дутуу бөглөсөн байна."],
  trim: true,
};

const ExperienceSchema = new mongoose.Schema({
  companyName: {
    type: String,
    ...defaultRules,
  },

  companyLogo: {
    type: String,
  },

  location: {
    type: Number,
    defualt: 1,
  },

  position: {
    type: String,
    ...defaultRules,
  },

  startDate: {
    type: String,
    ...defaultRules,
  },

  endDate: {
    type: String,
  },

  about: {
    type: String,
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
    ref: "User",
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

module.exports = mongoose.model("Experience", ExperienceSchema);
