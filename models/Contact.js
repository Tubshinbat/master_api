const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Та өөрийн нэрийг заавал оруулах шаардлагатай."],
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Имэйл хаягаа буруу оруулсан байна",
      ],
    },

    phoneNumber: {
      type: String,
      required: [true, "Утасны дугаараа оруулна уу"],
      trim: true,
      match: [/^[0-9+]{6,20}$/, "Утасны дугаар буруу байна"],
    },

    subject: {
      type: String,
      trim: true,
      required: [true, "Санал хүсэлтийн сэдвийг оруулна уу"],
    },

    message: {
      type: String,
      required: [true, "Санал хүсэлтээ бичнэ үү"],
      trim: true,
    },

    type: {
      type: String,
      enum: ["general", "support", "complaint", "business"],
      default: "general",
    },

    status: {
      type: String,
      enum: ["pending", "read", "archived"],
      default: "pending",
    },

    reply: {
      message: { type: String, trim: true },
      createdAt: { type: Date },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true },

    isDeleted: { type: Boolean, default: false },

    createUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updateUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", ContactSchema);
