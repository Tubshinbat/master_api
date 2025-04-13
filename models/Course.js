const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const defaultRules = {
  required: [true, "Заавал бөглөх талбаруудыг дутуу бөглөсөн байна."],
  trim: true,
};

const CourseSchema = new mongoose.Schema(
  {
    status: {
      type: Boolean,
      default: true,
    },

    languages: {
      type: Map,
      of: new mongoose.Schema({
        name: { type: String, trim: true, default: "" },
        about: { type: String, trim: true, default: "" },
      }),
      required: true,
    },

    slug: {
      type: String,
      unique: true,
      trim: true,
    },

    price: {
      type: Number,
      default: 0,
    },

    duration: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: ["online", "class"],
      default: "online",
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    partner: {
      type: mongoose.Schema.ObjectId,
      ref: "Partner",
    },

    hostUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    hostCompany: {
      type: mongoose.Schema.ObjectId,
      ref: "Partner",
    },

    registerMembers: [
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

    students: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Members",
      },
    ],

    category: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "MemberCategories",
      },
    ],

    pictures: [
      {
        type: String,
        trim: true,
      },
    ],

    views: {
      type: Number,
      default: 0,
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

CourseSchema.pre("save", async function (next) {
  if (!this.slug && this.languages?.get("mn")?.name) {
    const baseSlug = slugify(this.languages.get("mn").name);
    let slug = baseSlug;
    let counter = 1;
    while (await mongoose.models.Course.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }
    this.slug = slug;
  }

  // Автомат status update if course is over
  if (this.endDate && this.endDate < new Date()) {
    this.status = false;
  }

  next();
});

module.exports = mongoose.model("Course", CourseSchema);
