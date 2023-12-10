const mongoose = require("mongoose");

const ProductRateSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Products",
  },

  name: {
    type: String,
  },

  comment: {
    type: String,
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

module.exports = mongoose.model("ProductRate", ProductRateSchema);
