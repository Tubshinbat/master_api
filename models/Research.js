const mongoose = require("mongoose");

const defaultRules = {
  required: [true, "Заавал бөглөх талбаруудыг дутуу бөглөсөн байна."],
  trim: true,
};

const ResearchSchema = new mongoose.Schema({
  name: {
    type: String,
    ...defaultRules,
  },

  date: {
    type: String,
    ...defaultRules,
  },

  price: {
    type: Number,
    ...defaultRules,
  },

  pictures: {
    type: [String],
    default: null,
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

module.exports = mongoose.model("Research", ResearchSchema);
