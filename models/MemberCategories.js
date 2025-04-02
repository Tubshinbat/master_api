const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const MemberCategoriesSchema = new mongoose.Schema(
  {
    status: {
      type: Boolean,
      default: true,
    },

    parentId: {
      type: mongoose.Schema.ObjectId,
      ref: "MemberCategories",
      default: null,
    },

    position: {
      type: Number,
      default: 0,
    },

    icon: {
      type: String,
      trim: true,
    },

    code: {
      type: Number,
      sparse: true,
    },

    languages: {
      type: Map,
      of: new mongoose.Schema({
        name: {
          type: String,
          trim: true,
          required: [true, "Нэрийг оруулна уу"],
        },
      }),
      required: true,
    },

    slug: {
      type: String,
      unique: true,
      trim: true,
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

// Slug автоматаар үүсгэх
MemberCategoriesSchema.pre("save", async function (next) {
  if (!this.slug && this.languages?.get("mn")?.name) {
    const baseSlug = slugify(this.languages.get("mn").name);
    let slug = baseSlug;
    let counter = 1;
    while (await mongoose.models.MemberCategories.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model("MemberCategories", MemberCategoriesSchema);
