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

  const partner = await Partner.create(req.body);
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
    .populate("category");

  const companyData = await Partner.findById(req.params.id);

  const countRating = await CompanyRate.find({
    company: companyData._id,
  }).count();

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
