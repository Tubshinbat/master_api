const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const ModuleSchema = new mongoose.Schema(
  {
    languages: {
      type: Map,
      of: new mongoose.Schema({
        name: { type: String, trim: true, default: "" },
        content: { type: String, trim: true, default: "" },
      }),
      required: true,
    },

    slug: {
      type: String,
      unique: true,
      trim: true,
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    duration: {
      type: String,
      trim: true,
    },

    videoType: {
      type: String,
      enum: ["youtube", "vimeo", "upload"],
      default: "upload",
    },

    videoUrl: {
      type: String,
      trim: true,
    },

    files: [
      {
        type: String, // file path or URL
        trim: true,
      },
    ],

    order: {
      type: Number,
      default: 0,
    },

    course: {
      type: mongoose.Schema.ObjectId,
      ref: "Course",
      required: true,
    },

    status: {
      type: Boolean,
      default: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    prerequisiteModules: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Module",
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
  { timestamps: true }
);

ModuleSchema.pre("save", async function (next) {
  if (!this.slug && this.languages?.get("mn")?.name) {
    const baseSlug = slugify(this.languages.get("mn").name);
    let slug = baseSlug;
    let counter = 1;
    while (await mongoose.models.Module.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }
    this.slug = slug;
  }

  next();
});

module.exports = mongoose.model("Module", ModuleSchema);
