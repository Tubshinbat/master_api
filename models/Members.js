const mongoose = require("mongoose");

const MembersSchema = new mongoose.Schema(
  {
    status: {
      type: Boolean,
      enum: [true, false],
      default: true,
    },

    memberShip: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },

    name: {
      type: String,
    },

    picture: {
      type: String,
      required: [true, "Зураг оруулна уу"],
    },

    shortAbout: {
      type: String,
    },

    about: {
      type: String,
    },

    position: {
      type: String,
    },

    partner: {
      type: mongoose.Schema.ObjectId,
      ref: "Partner",
    },

    category: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "MemberCategories",
      },
    ],

    links: { type: String },
    experience: { type: String },

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
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("Members", MembersSchema);
