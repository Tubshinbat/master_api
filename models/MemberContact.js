const mongoose = require("mongoose");

const defaultRules = {
  required: [true, "Заавал бөглөх талбаруудыг дутуу бөглөсөн байна."],
  trim: true,
};

const MemberContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      ...defaultRules,
    },

    type: {
      type: String,
      enum: ["phone", "email", "website", "social"],
      required: [true, "Холбоо барих төрлийг сонгоно уу"],
    },

    link: {
      type: String,
      required: [true, "Холбоо барих утга шаардлагатай."],
      trim: true,
      validate: {
        validator: function (val) {
          switch (this.type) {
            case "phone":
              return /^[0-9+]{6,20}$/.test(val);
            case "email":
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            case "website":
            case "social":
              return /^(https?:\/\/)?[^\s]+$/.test(val);
            default:
              return true;
          }
        },
        message: "Холбоосын утга тохирох формат биш байна",
      },
    },

    note: {
      type: String,
      trim: true,
    },

    member: {
      type: mongoose.Schema.ObjectId,
      ref: "Members",
      required: true,
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
  { timestamps: true }
);

module.exports = mongoose.model("MemberContact", MemberContactSchema);
