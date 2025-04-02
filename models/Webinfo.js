const mongoose = require("mongoose");

const WebInfoSchema = new mongoose.Schema(
  {
    languages: {
      type: Map,
      of: new mongoose.Schema({
        siteTitle: { type: String, trim: true, default: "" },
        logo: { type: String, default: "" },
        whiteLogo: { type: String, default: "" },
        siteShortInfo: { type: String, trim: true, default: "" },
        siteInfo: { type: String, trim: true, default: "" },
        policy: { type: String, trim: true, default: "" },
        address: { type: String, trim: true, default: "" },
      }),
      required: true,
    },

    aboutPicture: { type: String, trim: true },

    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+]{6,20}$/, "Утасны дугаар буруу байна"],
    },

    email: {
      type: String,
      trim: true,
      match: [/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, "Имэйл формат буруу байна"],
    },

    trackingScripts: {
      type: Map,
      of: String,
      default: {},
    },

    defaultLanguage: {
      type: String,
      default: "mn",
    },

    contentLanguages: {
      type: [String],
      validate: {
        validator: langs => langs.every(l => ["mn", "en", "ru", "jp", "ko", "cn"].includes(l)),
        message: "Зөвшөөрөгдөөгүй хэл байна",
      },
      default: ["mn"],
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    favicon: { type: String, trim: true },
    ogImage: { type: String, trim: true },

    seoMeta: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: [{ type: String, trim: true }],
    },

    updateUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

WebInfoSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("WebInfo", WebInfoSchema);
