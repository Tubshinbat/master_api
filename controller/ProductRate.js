const ProductRate = require("../models/ProductRate");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { valueRequired } = require("../lib/check");
const { productSearch } = require("../lib/searchOfterModel");

exports.createRate = asyncHandler(async (req, res, next) => {
  const productCheck = await ProductRate.find({
    phoneNumber: req.body.phoneNumber,
    product: req.body.product,
  });

  if (valueRequired(req.body.rate)) {
    const rate = parseInt(req.body.rate);
    if (rate <= 0 && rate > 5) {
      throw new MyError("Үнэлгээ 1-5ын хооронд өгөх боломжтой", "400");
    }
  }

  const productRate = await ProductRate.create(req.body);
  res.status(200).json({
    success: true,
    data: productRate,
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
  const product = req.query.product;

  const query = ProductRate.find();

  if (valueRequired(phoneNumber)) {
    query.find({ phoneNumber: phoneNumber });
  }

  if (valueRequired(rate)) {
    query.find({ rate: rate });
  }

  if (valueRequired(product)) {
    const data = await productSearch(product);
    if (data) query.where("product").in(data);
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
  query.populate("product");

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, ProductRate, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const productRate = await query.exec();

  res.status(200).json({
    success: true,
    count: productRate.length,
    data: productRate,
    pagination,
  });
});

exports.multDeleteRate = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findRates = await ProductRate.find({ _id: { $in: ids } });

  if (findRates.length <= 0) {
    throw new MyError("Таны сонгосон өгөгдөл олдсонгүй", 400);
  }

  await ProductRate.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getRate = asyncHandler(async (req, res, next) => {
  const rate = await ProductRate.findByIdAndUpdate(req.params.id).populate(
    "product"
  );

  if (!rate) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: rate,
  });
});
