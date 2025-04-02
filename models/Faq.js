const mongoose = require("mongoose");

const FaqSchema = new mongoose.Schema(
  {
    status: {
      type: Boolean,
      default: true,
    },

    question: {
      type: String,
      trim: true,
      required: [true, "Асуулт оруулна уу"],
    },

    answer: {
      type: String,
      trim: true,
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
  { timestamps: true } // createdAt, updatedAt автоматаар үүснэ
);
