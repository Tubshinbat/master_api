const mongoose = require("mongoose");

const defaultRules = {
  required: [true, "Заавал бөглөх талбаруудыг дутуу бөглөсөн байна."],
  trim: true,
};

const CourseSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    enum: [true, false],
    default: true,
  },

  name: {
    type: String,
    ...defaultRules,
  },

  slug: {
    type: String,
  },

  about: {
    type: String,
  },

  views: {
    type: Number,
    default: 0,
  },

  partner: {
    type: mongoose.Schema.ObjectId,
    ref: "Partner",
  },

  teachers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Members",
    },
  ],

  students: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Members",
    },
  ],

  category: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "MemberCategories",
    },
  ],

  picture: {
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

  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },

  updateUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Course", CourseSchema);
