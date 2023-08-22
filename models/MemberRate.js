const mongoose = require("mongoose");

const MemberRateSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.ObjectId,
    ref: "Members",
  },

  phoneNumber: {
    type: Number,
  },

  rate: {
    type: Number,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MemberRate", MemberRateSchema);
