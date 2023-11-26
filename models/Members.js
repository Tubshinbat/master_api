const mongoose = require("mongoose");
const MemberRate = require("./MemberRate");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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

    isCompany: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },

    lat: {
      type: String,
      default: "47.91913589111381",
    },

    long: {
      type: String,
      default: "106.91757790656888",
    },

    lastName: {
      type: String,
    },

    name: {
      type: String,
    },

    picture: {
      type: String,
    },

    cover: {
      type: String,
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

    role: {
      type: String,
      required: [true, "Хэрэглэгчийн эрхийг сонгоно уу"],
      enum: ["member", "partner"],
      default: "member",
    },

    category: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "MemberCategories",
      },
    ],

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

    rating: {
      type: Number,
      default: 0,
    },

    ratingCount: {
      type: Number,
      default: 0,
    },

    password: {
      type: String,
      minlength: [8, "Нууц үг 8 - аас дээш тэмэгдээс бүтэх ёстой."],
      required: [true, "Нууц үгээ оруулна уу"],
      select: false,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,

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

MembersSchema.pre("save", async function (next) {
  // Өөрчлөгдсөн эсэхийг шалгана
  if (!this.isModified("password")) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

MembersSchema.methods.getJsonWebToken = function () {
  const token = jwt.sign(
    {
      id: this._id,
      role: this.role,
      name: this.name,
      phoneNumber: this.phoneNumber,
      email: this.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRESIN,
    },
    { algorithm: "RS256" }
  );
  return token;
};

MembersSchema.methods.checkPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

MembersSchema.methods.generatePasswordChangeToken = function () {
  // const resetToken = crypto.randomBytes(20).toString("hex");
  const resetToken = 100000 + Math.floor(Math.random() * 900000);
  // this.resetPasswordToken = crypto
  //   .createHash("sha256")
  //   .update(resetToken)
  //   .digest("hex");
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("Members", MembersSchema);
