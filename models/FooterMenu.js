const mongoose = require("mongoose");
const { slugify } = require("transliteration");

const FooterMenuSchema = new mongoose.Schema(
  {
    status: { type: Boolean, default: true },

    isDirect: { type: Boolean, default: false },
    isModel: { type: Boolean, default: false },
    inWindow: { type: Boolean, default: false },
    mainLink: { type: Boolean, default: true },

    // Олон хэлтэй нэршил
    languages: {
      type: Map,
      of: new mongoose.Schema({
        name: { type: String, trim: true, default: "" },
        short: { type: String, trim: true, default: "" },
      }),
      required: true,
    },

    slug: { type: String },
    direct: { type: String, trim: true },

    // Эцэг цэс
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      default: null,
    },

    position: { type: Number, default: 1 },

    // Model холбоос (dynamic link)
    model: { type: String, trim: true },

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

function generateSlugFromLanguages(languages) {
  for (const [key, value] of languages.entries()) {
    if (value?.name) {
      return slugify(value.name);
    }
  }
  return "";
}

async function ensureUniqueSlug(model, baseSlug, counter = 0) {
  const slug = counter === 0 ? baseSlug : `${baseSlug}_${counter}`;
  const existing = await model.findOne({ slug });
  if (!existing) return slug;
  return ensureUniqueSlug(model, baseSlug, counter + 1);
}

FooterMenuSchema.pre("save", async function (next) {
  const baseSlug = generateSlugFromLanguages(this.languages);
  if (baseSlug) {
    this.slug = await ensureUniqueSlug(this.constructor, baseSlug);
  }
  next();
});

FooterMenuSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.languages instanceof Map || typeof update.languages === "object") {
    const baseSlug = generateSlugFromLanguages(update.languages);
    if (baseSlug) {
      const slug = await ensureUniqueSlug(this.model, baseSlug);
      this.set({ slug });
    }
  }
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model("FooterMenu", FooterMenuSchema);
