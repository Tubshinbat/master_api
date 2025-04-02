const mongoose = require("mongoose");

const TranslationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Орчуулгын түлхүүр заавал байх ёстой"],
      unique: true,
      trim: true,
    },

    values: {
      type: Map,
      of: String, // dynamic: mn, en, ru, jp г.м
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    isSystem: {
      type: Boolean,
      default: false, // системийн үндсэн текст үү (устгаж болохгүй)
    },

    updateUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Translation", TranslationSchema);
