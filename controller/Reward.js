const Reward = require("../models/Reward");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { userSearch, RegexOptions } = require("../lib/searchOfterModel");

exports.createReward = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;

  const reward = await Reward.create(req.body);
  res.status(200).json({
    success: true,
    data: reward,
  });
});

exports.getReward = asyncHandler(async (req, res) => {
  let reward = await Reward.findById(req.params.id);

  if (!reward) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: reward,
  });
});

exports.getRewards = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 24;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  const userInputs = req.query;
  const fields = ["name", "date"];
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const pkey = req.query.pkey;
  const query = Reward.find();

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

  const pagination = await paginate(page, limit, Reward, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  let reward = await query.exec();

  res.status(200).json({
    success: true,
    count: reward.length,
    data: reward,
    pagination,
  });
});

exports.updateReward = asyncHandler(async (req, res) => {
  let reward = await Reward.findById(req.params.id);

  if (!reward) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  if (req.userRole === "admin" && req.userRole === "operator") {
  } else if (req.userRole === "member" && req.userId !== reward.pkey) {
    throw new MyError("Хандах эрхгүй байна", 400);
  }

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  reward = await Reward.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: member,
  });
});

exports.deleteReward = asyncHandler(async (req, res) => {
  let reward = await Reward.findById(req.params.id);

  if (!reward) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  if (req.userRole === "admin" && req.userRole === "operator") {
  } else if (req.userRole === "member" && req.userId !== reward.pkey) {
    throw new MyError("Хандах эрхгүй байна", 400);
  }

  reward.remove();

  res.status(200).json({
    success: true,
    data: reward,
  });
});
