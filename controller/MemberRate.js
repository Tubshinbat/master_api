const MemberRate = require("../models/MemberRate");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");
const { userSearch } = require("../lib/searchOfterModel");

exports.createRate = asyncHandler(async (req, res, next) => {
  const memberCheck = await MemberRate.find({
    phoneNumber: req.body.phoneNumber,
    member: req.body.member,
  });

  if (memberCheck.length > 0) {
    throw new MyError("Та өмнө үнэлгээ өгсөн байна", "400");
  }

  if (valueRequired(req.body.rate)) {
    const rate = parseInt(req.body.rate);
    if (rate <= 0 && rate > 5) {
      throw new MyError("Үнэлгээ 1-5ын хооронд өгөх боломжтой", "400");
    }
  }

  const memberRate = await MemberRate.create(req.body);
  res.status(200).json({
    success: true,
    data: memberRate,
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
  const member = req.query.member;

  const query = MemberRate.find();

  if (valueRequired(phoneNumber)) {
    query.find({ phoneNumber: phoneNumber });
  }

  if (valueRequired(rate)) {
    query.find({ rate: rate });
  }

  if (valueRequired(member)) {
    const userData = await userSearch(member);
    if (userData) query.where("member").in(userData);
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
  query.populate("member");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, MemberRate, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const memberRate = await query.exec();

  res.status(200).json({
    success: true,
    count: memberRate.length,
    data: memberRate,
    pagination,
  });
});

exports.multDeleteRate = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findRates = await MemberRate.find({ _id: { $in: ids } });

  if (findRates.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөл олдсонгүй", 400);
  }

  await MemberRate.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getRate = asyncHandler(async (req, res, next) => {
  const rate = await MemberRate.findByIdAndUpdate(req.params.id).populate(
    "member"
  );

  if (!rate) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: rate,
  });
});
