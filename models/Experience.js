const mongoose = require("mongoose");

const defaultRules = {
  required: [true, "Заавал бөглөх талбаруудыг дутуу бөглөсөн байна."],
  trim: true,
};

const ExperienceSchema = new mongoose.Schema({
  isCurrent: { type: Boolean, default: false }, 
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

ExperienceSchema.virtual("duration").get(function () {
  const start = this.startDate;
  const end = this.endDate || new Date();
  const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(diffInMonths / 12);
  const months = diffInMonths % 12;
  return `${years ? years + ' жил ' : ''}${months ? months + ' сар' : ''}`.trim();
});


module.exports = mongoose.model("Experience", ExperienceSchema);
