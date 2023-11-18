const Participation = require("../models/Participation");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { userSearch, RegexOptions } = require("../lib/searchOfterModel");

exports.createParticipation = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;

  const participation = await Participation.create(req.body);
  res.status(200).json({
    success: true,
    data: participation,
  });
});

exports.getParticipation = asyncHandler(async (req, res) => {
  let participation = await Participation.findById(req.params.id);

  if (!participation) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: participation,
  });
});

exports.getParticipations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || { date: 1 };
  const select = req.query.select;

  const userInputs = req.query;
  const fields = ["name", "date"];
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const pkey = req.query.pkey;

  const query = Participation.find();

  fields.map((field) => {
    if (valueRequired(userInputs[field])) {
      const arrayList = userInputs[field].split(",");
      if (arrayList > 1) query.find({ [field]: { $in: arrayList } });
      else {
        query.find({ [field]: RegexOptions(userInputs[field]) });
      }
    }
  });

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(pkey)) {
    const userData = await userSearch(pkey);
    if (userData) query.where("pkey").in(userData);
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
      else if (spliteSort[0] == "undefined") query.sort({ date: 1 });
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

  const pagination = await paginate(page, limit, Participation, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  let participation = await query.exec();

  res.status(200).json({
    success: true,
    count: participation.length,
    data: participation,
    pagination,
  });
});

exports.updateParticipation = asyncHandler(async (req, res) => {
  let participation = await Participation.findById(req.params.id);

  if (!participation) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  const ok = await Participation.findOne({
    _id: req.params.id,
    pkey: req.userId,
  });

  if (req.userRole === "member" && !valueRequired(ok)) {
    throw new MyError("Хандах эрхгүй байна", 400);
  }
  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  participation = await Participation.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: participation,
  });
});

exports.deleteParticipation = asyncHandler(async (req, res) => {
  const ok = await Participation.findOne({
    _id: req.params.id,
    pkey: req.userId,
  });

  if (req.userRole === "member" && !valueRequired(ok)) {
    throw new MyError("Хандах эрхгүй байна", 400);
  }

  let participation = await Participation.findById(req.params.id);

  if (!participation) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  participation.pictures &&
    participation.pictures.length > 0 &&
    participation.pictures.map(async (el) => {
      await imageDelete(el);
    });

  participation.remove();

  res.status(200).json({
    success: true,
    data: participation,
  });
});
