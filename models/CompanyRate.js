const mongoose = require("mongoose");

const CompanyRateSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    ref: "Partner",
  },

  phoneNumber: {
    type: Number,
  },

  rate: {
    type: Number,
  },

  name: {
    type: String,
  },

  comment: {
    type: String,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CompanyRate", CompanyRateSchema);
