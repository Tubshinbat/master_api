const ContactLink = require("../models/ContactLinks");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { valueRequired } = require("../lib/check");
const { userSearch, RegexOptions } = require("../lib/searchOfterModel");

exports.createContactLink = asyncHandler(async (req, res) => {
  req.userFront === true
    ? (req.body.pkey = req.userId)
    : (req.body.createUser = req.userId);

  const contact = await ContactLink.create(req.body);
  res.status(200).json({
    success: true,
    data: contact,
  });
});

exports.getContactLink = asyncHandler(async (req, res) => {
  const contactLink = await ContactLink.findById(req.params.id);

  if (!valueRequired(contactLink))
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);

  if (req.userFront === true) {
    const ok = await ContactLink.findOne({
      _id: req.params.id,
      pkey: req.userRole,
    });

    if (!valueRequired(ok))
      throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: contactLink,
  });
});

exports.getContactLinks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //  FIELDS
  const userInputs = req.query;
  const fields = ["name", "link"];
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const pkey = req.query.pkey;

  const query = ContactLink.find();

  if (req.userFront === true) {
    query.find({ pkey: req.userId });
  }

  fields.map((field) => {
    if (valueRequired(userInputs[field])) {
      const arrayList = userInputs[field].split(",");
      if (arrayList > 1) query.find({ [field]: { $in: arrayList } });
      else query.find({ [field]: RegexOptions(userInputs[field]) });
    }
  });

  if (valueRequired(pkey)) {
    const userData = await memberSearch(pkey);
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
      let convertSort = { createAt: -1 };
      if (spliteSort[1] === "ascend") {
        convertSort = { [spliteSort[0]]: 1 };
      } else {
        convertSort = { [spliteSort[0]]: -1 };
      }
      if (!valueRequired(spliteSort[0])) query.sort(convertSort);
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

  const pagination = await paginate(page, limit, ContactLink, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  let contactLinks = await query.exec();

  res.status(200).json({
    success: true,
    count: contactLinks.length,
    data: contactLinks,
    pagination,
  });
});

exports.updateContactLinks = asyncHandler(async (req, res) => {
  let contactLink = await ContactLink.findById(req.params.id);

  if (!valueRequired(contactLink))
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);

  if (req.userFront === true) {
    const data = await ContactLink.findOne({
      _id: req.params.id,
      pkey: req.userId,
    });
    if (!valueRequired(data))
      throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  } else {
    req.body.updateUser = req.userId;
  }

  req.body.updateAt = Date.now();

  contactLink = await ContactLink.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: contactLink,
  });
});

exports.deleteContactLink = asyncHandler(async (req, res) => {
  if (req.userFront === true) {
    const data = await ContactLink.findOne({
      _id: req.params.id,
      pkey: req.userId,
    });
    if (!valueRequired(data))
      throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  let contactLink = await ContactLink.findById(req.params.id);
  if (!valueRequired(contactLink))
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);

  contactLink.remove();

  res.status(200).json({
    success: true,
    data: contactLink,
  });
});
