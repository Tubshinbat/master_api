const CompanyRate = require("../models/CompanyRate");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");
const { partnerSearch } = require("../lib/searchOfterModel");

exports.createRate = asyncHandler(async (req, res, next) => {
  const check = await CompanyRate.find({
    phoneNumber: req.body.phoneNumber,
    company: req.body.partner,
  });

  if (valueRequired(req.body.rate)) {
    const rate = parseInt(req.body.rate);
    if (rate <= 0 && rate > 5) {
      throw new MyError("Үнэлгээ 1-5ын хооронд өгөх боломжтой", "400");
    }
  }

  const companyRate = await CompanyRate.create(req.body);
  res.status(200).json({
    success: true,
    data: companyRate,
  });
});

exports.getRates = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  // PARTNER FIELDS
  const phoneNumber = req.query.phoneNumber;
  const rate = req.query.rate;
  const partner = req.query.partner;

  const query = CompanyRate.find();

  if (valueRequired(phoneNumber)) {
    query.find({ phoneNumber: phoneNumber });
  }

  if (valueRequired(rate)) {
    query.find({ rate: rate });
  }

  if (valueRequired(partner)) {
    const userData = await partnerSearch(partner);
    if (userData) query.where("company").in(userData);
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
  query.populate("company");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, CompanyRate, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const companyRate = await query.exec();

  res.status(200).json({
    success: true,
    count: companyRate.length,
    data: companyRate,
    pagination,
  });
});

exports.multDeleteRate = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findRates = await CompanyRate.find({ _id: { $in: ids } });

  if (findRates.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөл олдсонгүй", 400);
  }

  await CompanyRate.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getRate = asyncHandler(async (req, res, next) => {
  const rate = await CompanyRate.findByIdAndUpdate(req.params.id).populate(
    "company"
  );

  if (!rate) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: rate,
  });
});
