const mongoose = require("mongoose");

const MemberCategoriesSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },
  parentId: {
    type: String,
  },
  position: {
    type: Number,
  },
  code: {
    type: Number,
  },

  name: {
    type: String,
  },

  slug: {
    type: String,
  },

  parentId: {
    type: String,
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

module.exports = mongoose.model("MemberCategories", MemberCategoriesSchema);
