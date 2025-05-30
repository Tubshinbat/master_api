const Experience = require("../models/Experience");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const {
  userSearch,
  RegexOptions,
  memberSearch,
} = require("../lib/searchOfterModel");

exports.createExperience = asyncHandler(async (req, res) => {
  req.userFront === true
    ? (req.body.pkey = req.userId)
    : (req.body.createUser = req.userId);

  const experience = await Experience.create(req.body);
  res.status(200).json({
    success: true,
    data: experience,
  });
});

exports.getExperience = asyncHandler(async (req, res) => {
  let experience = await Experience.findById(req.params.id);

  if (!experience) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  if (req.userFront == true) {
    const isCheck = await Experience.find({
      _id: req.params.id,
      pkey: req.userId,
    });

    if (!valueRequired(isCheck))
      throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: experience,
  });
});

exports.getExperiences = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  let sort = req.query.sort || { startDate: 1 };

  const userInputs = req.query;
  const fields = ["companyName", "position", "startDate", "endDate"];
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const pkey = req.query.pkey;

  console.log(req.query);

  const query = Experience.find();

  if (req.userFront) {
    query.find({ pkey: req.userId });
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
    query.where("pkey").in(pkey);
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
      let convertSort = { startDate: 1 };
      if (spliteSort[1] === "ascend") {
        convertSort = { [spliteSort[0]]: 1 };
      } else {
        convertSort = { [spliteSort[0]]: -1 };
      }

      if (spliteSort[0] != "undefined") query.sort(convertSort);
      else if (spliteSort[0] == "undefined") query.sort({ startDate: 1 });
    } else {
      query.sort(sort);
    }
  }

  query.populate("createUser");
  query.populate("updateUser");
  query.populate("pkey");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Experience, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  let experience = await query.exec();

  res.status(200).json({
    success: true,
    count: experience.length,
    data: experience,
    pagination,
  });
});

exports.updateExperience = asyncHandler(async (req, res) => {
  let experience = await Experience.findById(req.params.id);

  if (!experience) throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);

  if (req.userFront == true) {
    const ok = await Experience.findOne({
      _id: req.params.id,
      pkey: req.userId,
    });

    if (!valueRequired(ok))
      throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  if (req.userFront) req.body.pkey = req.userId;
  else req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  experience = await Experience.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: experience,
  });
});

exports.deleteExperience = asyncHandler(async (req, res) => {
  let experience = await Experience.findById(req.params.id);

  if (!experience) throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);

  if (req.userFront) {
    const ok = await Experience.findOne({
      _id: req.params.id,
      pkey: req.userId,
    });

    if (!valueRequired(ok))
      throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  experience.companyLogo && (await imageDelete(experience.companyLogo));
  experience.remove();

  res.status(200).json({
    success: true,
    data: experience,
  });
});
