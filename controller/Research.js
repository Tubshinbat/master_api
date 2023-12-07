const Research = require("../models/Research");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { userSearch, RegexOptions } = require("../lib/searchOfterModel");

exports.createResearch = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;

  const research = await Research.create(req.body);
  res.status(200).json({
    success: true,
    data: research,
  });
});

exports.getResearch = asyncHandler(async (req, res) => {
  let research = await Research.findById(req.params.id);

  if (!research) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: research,
  });
});

exports.getResearchs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 24;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;
  const isUser = req.query.usersearch || null;

  const userInputs = req.query;
  const fields = ["name", "date"];
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const pkey = req.query.pkey;
  const query = Research.find();

  if (valueRequired(isUser)) {
    if (isUser === true || isUser == "true") {
      query.find({ pkey: req.userId });
    }
  }

  fields.map((field) => {
    if (valueRequired(userInputs[field])) {
      const arrayList = userInputs[field].split(",");
      if (arrayList > 1) query.find({ [field]: { $in: arrayList } });
      else {
        query.find({ [field]: RegexOptions(userInputs[field]) });
      }
    }
  });

  if (valueRequired(pkey)) {
    const userData = await userSearch(pkey);
    if (userData) query.where("pkey").in(userData);
  }

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      let convertSort = {};
      if (spliteSort[1] === "ascend") {
        convertSort = { [spliteSort[0]]: 1 };
      } else {
        convertSort = { [spliteSort[0]]: -1 };
      }
      if (spliteSort[0] != "undefined") query.sort(convertSort);
    } else {
      query.sort(sort);
    }
  }

  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Research, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  let research = await query.exec();

  res.status(200).json({
    success: true,
    count: research.length,
    data: research,
    pagination,
  });
});

exports.updateResearch = asyncHandler(async (req, res) => {
  let research = await Research.findById(req.params.id);

  if (!research) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }
  const ok = await Research.findOne({
    _id: req.params.id,
    pkey: req.userId,
  });

  if (req.userRole === "member" && !valueRequired(ok)) {
    throw new MyError("Хандах эрхгүй байна", 400);
  }

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  research = await Research.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: member,
  });
});

exports.deleteResearch = asyncHandler(async (req, res) => {
  let research = await Research.findById(req.params.id);

  if (!research) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  const ok = await Research.findOne({
    _id: req.params.id,
    pkey: req.userId,
  });

  if (req.userRole === "member" && !valueRequired(ok)) {
    throw new MyError("Хандах эрхгүй байна", 400);
  }

  research.pictures &&
    research.pictures.length > 0 &&
    research.pictures.map(async (el) => {
      await imageDelete(el);
    });

  research.remove();

  res.status(200).json({
    success: true,
    data: research,
  });
});
