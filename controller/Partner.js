const Partner = require("../models/Partner");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { userSearch, RegexOptions } = require("../lib/searchOfterModel");
const MemberCategories = require("../models/MemberCategories");
const Members = require("../models/Members");
const CompanyRate = require("../models/CompanyRate");

exports.createPartner = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;
  req.body.updateUser = req.userId;

  // category parse
  if (req.body.category) {
    try {
      if (typeof req.body.category === "string") {
        req.body.category = JSON.parse(req.body.category);
      }
    } catch (err) {
      req.body.category = [];
    }
  }

  // links parse
  if (req.body.links) {
    try {
      if (typeof req.body.links === "string") {
        req.body.links = JSON.parse(req.body.links);
      }
    } catch (err) {
      req.body.links = [];
    }
  }

  // location parse
  if (req.body.location) {
    try {
      if (typeof req.body.location === "string") {
        req.body.location = JSON.parse(req.body.location);
      }
    } catch (err) {
      req.body.location = null;
    }
  }

  // admins parse
  if (req.body.admins) {
    try {
      if (typeof req.body.admins === "string") {
        req.body.admins = JSON.parse(req.body.admins);
      }
    } catch (err) {
      req.body.admins = [];
    }
  }

  // employees parse
  if (req.body.employees) {
    try {
      if (typeof req.body.employees === "string") {
        req.body.employees = JSON.parse(req.body.employees);
      }
    } catch (err) {
      req.body.employees = [];
    }
  }

  // teachers parse
  if (req.body.teachers) {
    try {
      if (typeof req.body.teachers === "string") {
        req.body.teachers = JSON.parse(req.body.teachers);
      }
    } catch (err) {
      req.body.teachers = [];
    }
  }

  const partner = await Partner.create(req.body);

  res.status(200).json({
    success: true,
    data: partner,
  });
});

exports.createUserPartner = asyncHandler(async (req, res, next) => {
  if (!valueRequired(req.userId)) {
    throw new MyError("Та нэвтэрсэн байх шаардлагатай", 400);
  }

  let category = [];
  let links = [];
  let location = null;

  if (req.body.category) {
    if (typeof req.body.category === "string") {
      category = JSON.parse(req.body.category);
    } else {
      category = req.body.category;
    }
  }

  if (req.body.links) {
    if (typeof req.body.links === "string") {
      links = JSON.parse(req.body.links);
    } else {
      links = req.body.links;
    }
  }

  if (req.body.location) {
    if (typeof req.body.location === "string") {
      location = JSON.parse(req.body.location);
    } else {
      location = req.body.location;
    }
  }

  const partner = await Partner.create({
    ...req.body,
    category,
    links,
    location,
    admins: [req.userId],
    status: false,
    createUser: req.userId,
    updateUser: req.userId,
  });

  res.status(200).json({
    success: true,
    data: partner,
  });
});

exports.updateUserPartner = asyncHandler(async (req, res, next) => {
  if (!valueRequired(req.userId)) {
    throw new MyError("Та нэвтэрсэн байх шаардлагатай", 400);
  }

  const partnerId = req.params.id;

  let category = [];
  let links = [];
  let location = null;
  let admins = [];
  let employees = [];
  let teachers = [];

  // Parse category
  if (req.body.category) {
    category =
      typeof req.body.category === "string"
        ? JSON.parse(req.body.category)
        : req.body.category;
  }

  // Parse links
  if (req.body.links) {
    links =
      typeof req.body.links === "string"
        ? JSON.parse(req.body.links)
        : req.body.links;
  }

  // Parse location
  if (req.body.location) {
    location =
      typeof req.body.location === "string"
        ? JSON.parse(req.body.location)
        : req.body.location;
  }

  // Parse admins
  if (req.body.admins) {
    admins =
      typeof req.body.admins === "string"
        ? JSON.parse(req.body.admins)
        : req.body.admins;
  }

  // Parse employees
  if (req.body.employees) {
    employees =
      typeof req.body.employees === "string"
        ? JSON.parse(req.body.employees)
        : req.body.employees;
  }

  // Parse teachers
  if (req.body.teachers) {
    teachers =
      typeof req.body.teachers === "string"
        ? JSON.parse(req.body.teachers)
        : req.body.teachers;
  }

  const updatedData = {
    ...req.body,
    category,
    links,
    location,
    admins,
    employees,
    teachers,
    updateUser: req.userId,
    updateAt: Date.now(),
  };

  const partner = await Partner.findByIdAndUpdate(partnerId, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!partner) {
    throw new MyError("Тухайн компани олдсонгүй", 404);
  }

  res.status(200).json({
    success: true,
    data: partner,
  });
});

exports.getPartners = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 40;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // PARTNER FIELDS
  const name = req.query.name;
  const link = req.query.link;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const status = req.query.status;
  const categories = req.query.categories;
  const category = req.query.category;
  const q = req.query.q;

  const query = Partner.find();

  if (valueRequired(q)) {
    query.where({
      $or: [{ name: RegexOptions(q) }, { about: RegexOptions(q) }],
    });
  }

  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });

  if (valueRequired(link))
    query.find({ link: { $regex: ".*" + link + ".*", $options: "i" } });

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(categories)) {
    const arrayList = categories.split(",");

    query.where("category").in(arrayList);
  }

  if (valueRequired(category)) {
    const catagoryData = await MemberCategories.find({
      name: RegexOptions(category),
    }).select("_id");
    if (catagoryData.length > 0) query.where("category").in(catagoryData);
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

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");
  query.populate("category");
  query.populate({
    path: "rating", // Use the path to the virtual property
    options: { localField: "_id", foreignField: "partner" }, // Provide localField and foreignField options
  });

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Partner, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const partners = await query.exec();

  for (const partner of partners) {
    const countRating = await CompanyRate.find({
      company: partner._id,
    }).count();

    if (countRating === 0) {
      partner.rating = 0; // Default value if there are no ratings
    } else {
      partner.ratingCount = countRating;
      const r5 = await CompanyRate.find({
        partner: partner._id,
        rate: 5,
      }).count();
      const r4 = await CompanyRate.find({
        partner: partner._id,
        rate: 4,
      }).count();
      const r3 = await CompanyRate.find({
        partner: partner._id,
        rate: 3,
      }).count();
      const r2 = await CompanyRate.find({
        partner: partner._id,
        rate: 2,
      }).count();
      const r1 = await CompanyRate.find({
        member: partner._id,
        rate: 1,
      }).count();

      const averageRating =
        (5 * r5 + 4 * r4 + 3 * r3 + 2 * r2 + 1 * r1) / (r1 + r2 + r3 + r4 + r5);

      partner.rating = parseInt(averageRating);
    }
  }

  res.status(200).json({
    success: true,
    count: partners.length,
    data: partners,
    pagination,
  });
});

exports.getUserPartners = asyncHandler(async (req, res, next) => {
  console.log(req.userId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // PARTNER FIELDS
  const name = req.query.name;
  const link = req.query.link;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const status = req.query.status;
  const categories = req.query.categories;
  const category = req.query.category;
  const q = req.query.q;
  const userId = req.userId;

  const query = Partner.find();

  if (valueRequired(userId) === false) {
    throw new MyError("Та нэвтэрсэн байх шаардлагатай", 400);
  } else {
    query.where("admins").equals(userId);
  }

  if (valueRequired(q)) {
    query.where({
      $or: [{ name: RegexOptions(q) }, { about: RegexOptions(q) }],
    });
  }

  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });

  if (valueRequired(link))
    query.find({ link: { $regex: ".*" + link + ".*", $options: "i" } });

  if (valueRequired(createUser)) {
    const userData = await userSearch(createUser);
    if (userData) query.where("createUser").in(userData);
  }

  if (valueRequired(updateUser)) {
    const userData = await userSearch(updateUser);
    if (userData) query.where("updateUser").in(userData);
  }

  if (valueRequired(categories)) {
    const arrayList = categories.split(",");

    query.where("category").in(arrayList);
  }

  if (valueRequired(category)) {
    const catagoryData = await MemberCategories.find({
      name: RegexOptions(category),
    }).select("_id");
    if (catagoryData.length > 0) query.where("category").in(catagoryData);
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

  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");

  query.populate({
    path: "rating", // Use the path to the virtual property
    options: { localField: "_id", foreignField: "partner" }, // Provide localField and foreignField options
  });

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Partner, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const partners = await query.exec();

  for (const partner of partners) {
    const countRating = await CompanyRate.find({
      company: partner._id,
    }).count();

    if (countRating === 0) {
      partner.rating = 0; // Default value if there are no ratings
    } else {
      partner.ratingCount = countRating;
      const r5 = await CompanyRate.find({
        partner: partner._id,
        rate: 5,
      }).count();
      const r4 = await CompanyRate.find({
        partner: partner._id,
        rate: 4,
      }).count();
      const r3 = await CompanyRate.find({
        partner: partner._id,
        rate: 3,
      }).count();
      const r2 = await CompanyRate.find({
        partner: partner._id,
        rate: 2,
      }).count();
      const r1 = await CompanyRate.find({
        member: partner._id,
        rate: 1,
      }).count();

      const averageRating =
        (5 * r5 + 4 * r4 + 3 * r3 + 2 * r2 + 1 * r1) / (r1 + r2 + r3 + r4 + r5);

      partner.rating = parseInt(averageRating);
    }
  }

  res.status(200).json({
    success: true,
    count: partners.length,
    data: partners,
    pagination,
  });
});

exports.getFullData = asyncHandler(async (req, res, next) => {
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // PARTNER FIELDS
  const name = req.query.name;
  const link = req.query.link;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  const status = req.query.status;

  const query = Partner.find();

  if (valueRequired(name))
    query.find({ name: { $regex: ".*" + name + ".*", $options: "i" } });

  if (valueRequired(link))
    query.find({ link: { $regex: ".*" + link + ".*", $options: "i" } });

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
  if (valueRequired(status)) {
    if (status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  query.select(select);
  query.populate({ path: "createUser", select: "firstName -_id" });
  query.populate({ path: "updateUser", select: "firstName -_id" });

  const partners = await query.exec();

  res.status(200).json({
    success: true,
    count: partners.length,
    data: partners,
  });
});

exports.multDeletePartner = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findPartner = await Partner.find({ _id: { $in: ids } });

  if (findPartner.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөл олдсонгүй", 400);
  }
  findPartner.map(async (el) => {
    el.cover && (await imageDelete(el.cover));
    el.logo && (await imageDelete(el.logo));
  });

  const partner = await Partner.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getPartner = asyncHandler(async (req, res) => {
  // if (!req.userFront) {
  //   if (
  //     req.memberTokenIs === true &&
  //     req.isMember === true &&
  //     req.userRole !== "partner"
  //   ) {
  //     throw new MyError("Хандах эрхгүй байна", 400);
  //   }
  // }

  const partner = await Partner.findById(req.params.id)
    .populate("createUser")
    .populate("updateUser")
    .populate("category admins employees teachers");

  const companyData = await Partner.findById(req.params.id);
  let countRating = 0;
  if (CompanyRate) {
    countRating = await CompanyRate.find({
      company: companyData._id,
    }).count();
  }

  if (countRating === 0) {
    partner.rating = 0; // Default value if there are no ratings
  } else {
    const r5 = await CompanyRate.find({
      company: companyData._id,
      rate: 5,
    }).count();
    const r4 = await CompanyRate.find({
      company: companyData._id,
      rate: 4,
    }).count();
    const r3 = await CompanyRate.find({
      company: companyData._id,
      rate: 3,
    }).count();
    const r2 = await CompanyRate.find({
      company: companyData._id,
      rate: 2,
    }).count();
    const r1 = await CompanyRate.find({
      company: companyData._id,
      rate: 1,
    }).count();

    const averageRating =
      (5 * r5 + 4 * r4 + 3 * r3 + 2 * r2 + 1 * r1) / (r1 + r2 + r3 + r4 + r5);

    partner.rating = parseInt(averageRating);
  }

  const ratingCount = await CompanyRate.find({
    company: companyData._id,
  }).count();

  partner.ratingCount = ratingCount;

  // if (
  //   req.memberTokenIs === true &&
  //   req.isMember === true &&
  //   req.userRole === "partner"
  // ) {
  //   const user = await Members.findById(req.userId);
  //   console.log(user.partner.toString() !== partner._id.toString());
  //   if (user.partner.toString() !== partner._id.toString()) {
  //     throw new MyError("Хандах эрхгүй байна", 400);
  //   }
  // }

  if (!partner) {
    throw new MyError("Тухайн мэдээ олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: partner,
  });
});

exports.updatePartner = asyncHandler(async (req, res, next) => {
  let partner = await Partner.findById(req.params.id);

  if (!partner) {
    throw new MyError("Тухайн мэдээ олдсонгүй. ", 404);
  }

  if (valueRequired(req.body.cover) === false) {
    req.body.cover = "";
  }

  if (valueRequired(req.body.logo) === false) {
    req.body.logo = "";
  }

  req.body.updateUser = req.userId;
  req.body.updateAt = Date.now();

  partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: partner,
  });
});

exports.getCountPartner = asyncHandler(async (req, res, next) => {
  const partner = await Partner.count();
  res.status(200).json({
    success: true,
    data: partner,
  });
});
