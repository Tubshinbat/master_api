const mongoose = require("mongoose");

const RateCriteriaSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MemberCategories",
      required: true,
    },

    key: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    languages: {
      type: Map,
      of: new mongoose.Schema({
        name: { type: String, trim: true, default: "" },
    
      }),
      required: true,
    },

    position: {
      type: Number,
      default: 1,
    },

    status: {
      type: Boolean,
      default: true,
    },

    createUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updateUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RateCriteria", RateCriteriaSchema);
