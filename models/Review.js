const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
    },

    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[0-9+]{6,20}$/, "Утасны дугаар буруу байна"],
      required: true,
    },

    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    scores: {
      type: Map,
      of: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Virtual field for average score
ReviewSchema.virtual("average").get(function () {
  const values = Array.from(this.scores.values());
  const total = values.reduce((sum, val) => sum + val, 0);
  return values.length ? total / values.length : 0;
});

// Хэрэглэгч нэг л удаа үнэлгээ өгч болно (phone + member/company)
ReviewSchema.index({ phoneNumber: 1, member: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ phoneNumber: 1, company: 1 }, { unique: true, sparse: true });

// Аль нэг нь заавал байх ёстой гэдгийг баталгаажуулах
ReviewSchema.pre("validate", function (next) {
  if (!this.member && !this.company) {
    next(new Error("Гишүүн эсвэл компани аль нэгийг сонгох ёстой."));
  } else {
    next();
  }
});

module.exports = mongoose.model("Review", ReviewSchema);
