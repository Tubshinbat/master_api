const Members = require("../models/Members");
const Partner = require("../models/Partner");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { userSearch, RegexOptions } = require("../lib/searchOfterModel");
const MemberCategories = require("../models/MemberCategories");

exports.createMember = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;

  const member = await Members.create(req.body);
  res.status(200).json({
    success: true,
    data: member,
  });
});

exports.getMembers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //  FIELDS
  const userInputs = req.query;
  const fields = ["name", "about", "position", "status"];
  const category = req.query.category;
  const partner = req.query.partner;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Members.find();

  fields.map((field) => {
    if (valueRequired(userInputs[field])) {
      const arrayList = userInputs[field].split(",");
      if (arrayList > 1) query.find({ field: { $in: arrayList } });
      else query.find({ field: RegexOptions(userInputs[field]) });
    }
  });

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(category)) {
    const catagoryData = await MemberCategories.find({
      name: RegexOptions(category),
    }).select("_id");
    if (catagoryData.length > 0) query.where("category").in(catagoryData);
  }

  if (valueRequired(partner)) {
    const partnerData = await Partner.find({
      name: RegexOptions(partner),
    }).select("_id");
    if (parentData.length > 0) query.where("partner").in(partnerData);
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
  query.populate("partner");
  query.populate("category");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Members, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const members = await query.exec();

  res.status(200).json({
    success: true,
    count: members.length,
    data: members,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res, next) => {
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //  FIELDS
  const userInputs = req.query;
  const fields = ["name", "about", "position", "status"];
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Members.find();

  fields.map((field) => {
    if (valueRequired(userInputs[field])) {
      const arrayList = userInputs[field].split(",");
      if (arrayList > 1) query.find({ field: { $in: arrayList } });
      else query.find({ field: RegexOptions(userInputs[field]) });
    }
  });

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

  const members = await query.exec();

  res.status(200).json({
    success: true,
    count: members.length,
    data: members,
  });
});

exports.multDeleteMember = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findMember = await Members.find({ _id: { $in: ids } });

  if (findMember.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөл олдсонгүй", 400);
  }

  findMember.map(async (el) => {
    el.photo && (await imageDelete(el.photo));
  });

  await Members.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getMember = asyncHandler(async (req, res, next) => {
  const member = await Members.findByIdAndUpdate(req.params.id)
    .populate("createUser")
    .populate("updateUser")
    .populate("partner")
    .populate("category");

  if (!member) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: member,
  });
});

exports.updateMember = asyncHandler(async (req, res, next) => {
  let member = await Members.findById(req.params.id);

  if (!member) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  member = await Members.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: member,
  });
});

exports.getCountMember = asyncHandler(async (req, res, next) => {
  const member = await Members.count();
  res.status(200).json({
    success: true,
    data: member,
  });
});
