const mongoose = require("mongoose");

const ProductsSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      trim: true,
    },

    code: {
      type: Number,
      default: 1,
    },

    status: {
      type: Boolean,
      enum: [true, false],
      default: true,
    },

    isDiscount: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },

    slug: {
      type: String,
      unique: true,
    },

    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Бүтээгдэхүүнй оруулна уу"],
    },

    price: {
      type: Number,
      trim: true,
      required: [true, "Дугуйны үнэ оруулна уу"],
    },

    discount: {
      type: Number,
      trim: true,
      default: 0,
    },

    details: {
      type: String,
      trim: true,
    },

    pictures: {
      type: [String],
    },

    views: {
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

    qty: {
      type: Number,
      default: 1,
    },

    productCategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "MemberCategories",
      },
    ],

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

module.exports = mongoose.model("Products", ProductsSchema);
