const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const PartnerSchema = new mongoose.Schema(
  {
    status: {
      type: Boolean,
      enum: [true, false],
      default: true,
    },

    slug: String,

    name: {
      type: String,
      trim: true,
      required: [true, "Хамтрагч компанийн нэрийг оруулна уу"],
    },

    email: {
      type: String,
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        "Имэйл хаягаа буруу оруулсан байна",
      ],
    },

    phoneNumber: {
      type: Number,
      unique: true,
      trim: true,
      required: [true, "Утасны дугаараа оруулна уу"],
    },

    about: {
      type: String,
      trim: true,
      required: [true, "Дэлгэрэнгүй мэдээллийг оруулна уу"],
    },

    links: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],

    category: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "MemberCategories",
      },
    ],

    cover: {
      type: String,
    },

    admins: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Members",
      },
    ],

    employees: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Members",
      },
    ],

    teachers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Members",
      },
    ],

    course: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Course",
      },
    ],

    logo: {
      type: String,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: false,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: false,
        default: [0, 0],
      },
    },

    rating: {
      type: Number,
      default: 0,
    },

    ratingCount: {
      type: Number,
      default: 0,
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
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("Partner", PartnerSchema);
