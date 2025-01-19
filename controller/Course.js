const Course = require("../models/Course");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { slugify } = require("transliteration");
const { userSearch, RegexOptions } = require("../lib/searchOfterModel");
const MemberCategories = require("../models/MemberCategories");

exports.createCourse = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;
  req.body.status = (valueRequired(req.body.status) && req.body.status) || true;

  const uniqueName = await Course.find({ name: req.body.name });
  if (uniqueName.length > 0) {
    req.body.slug = slugify(req.body.name + "_" + uniqueName.length);
  } else {
    req.body.slug = slugify(req.body.name);
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.getCoursies = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 21;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // NEWS FIELDS
  const userInputs = req.query;
  const fields = ["status", "name", "categories"];
  const categories = req.query.categories;
  const category = req.query.category;
  const partner = req.query.partner;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Course.find();

  if (valueRequired(category)) {
    const catagoryData = await MemberCategories.find({
      name: RegexOptions(category),
    }).select("_id");
    if (catagoryData.length > 0) query.where("category").in(catagoryData);
  }

  if (valueRequired(partner)) {
    const arrayList = partner.split(",");
    query.where("partner").in(arrayList);
  }

  if (valueRequired(categories)) {
    const arrayList = categories.split(",");
    query.where("category").in(arrayList);
  }

  fields.map((field) => {
    if (valueRequired(userInputs[field])) {
      const arrayList = userInputs[field].split(",");
      if (arrayList > 1) query.find({ field: { $in: arrayList } });
      else query.find({ field: RegexOptions(userInputs[field]) });
    }
  });

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) {
      query.where("createUser").in(userData);
    }
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) {
      query.where("updateUser").in(userData);
    }
  }

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      if (spliteSort.length > 0) {
        let convertSort = {};
        if (spliteSort[1] === "ascend") {
          convertSort = { [spliteSort[0]]: 1 };
        } else {
          convertSort = { [spliteSort[0]]: -1 };
        }
        if (spliteSort[0] != "undefined") query.sort(convertSort);
      }

      const splite = sort.split("_");
      if (splite.length > 0) {
        let convertSort = {};
        if (splite[1] === "ascend") {
          convertSort = { [splite[0]]: 1 };
        } else {
          convertSort = { [splite[0]]: -1 };
        }
        if (splite[0] != "undefined") query.sort(convertSort);
      }
    } else {
      query.sort(sort);
    }
  }

  query.select(select);
  query
    .populate("category")
    .populate("createUser")
    .populate("updateUser")
    .populate("partner")
    .populate("teachers")
    .populate("students");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Course, result);

  query.limit(limit);
  query.skip(pagination.start - 1);
  const course = await query.exec();

  res.status(200).json({
    success: true,
    count: course.length,
    data: course,
    pagination,
  });
});

exports.multDeleteCourse = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findCourse = await Course.find({ _id: { $in: ids } });

  if (findCourse.length <= 0) {
    throw new MyError("Таны сонгосон мэдээнүүд олдсонгүй", 400);
  }
  findCourse.map(async (el) => {
    el.picture && (await imageDelete(el.picture));
  });

  await Course.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getSingleCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate("category")
    .populate("partner")
    .populate("teachers")
    .populate("students");

  if (!course) {
    throw new MyError("Тухайн мэдээ олдсонгүй. ", 404);
  }

  course.views = course.views + 1;
  course.save();

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    throw new MyError("Тухайн мэдээ олдсонгүй. ", 404);
  }

  const name = req.body.name;
  const nameUnique = await Course.find({}).where("name").equals(name);

  if (nameUnique.length > 1) {
    req.body.slug =
      nameUnique[nameUnique.length - 1].slug + (nameUnique + 1).toString();
  } else {
    req.body.slug = slugify(name);
  }

  if (valueRequired(req.body.pictures) === false) {
    req.body.pictures = [];
  }

  if (valueRequired(req.body.category) === false) {
    req.body.category = [];
  }

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.getCountCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.count();
  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.getSlugCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findOne({ slug: req.params.slug })
    .populate("partner")
    .populate("category")
    .populate("teachers")
    .populate("students");

  if (!course) {
    throw new MyError("Тухайн мэдээ олдсонгүй. ", 404);
  }

  course.views = course.views + 1;
  course.update();

  res.status(200).json({
    success: true,
    data: course,
  });
});
