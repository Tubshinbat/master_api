const Members = require("../models/Members");
const Partner = require("../models/Partner");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");
const { userSearch, RegexOptions } = require("../lib/searchOfterModel");
const MemberCategories = require("../models/MemberCategories");
const MemberRate = require("../models/MemberRate");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const { find, findByIdAndUpdate } = require("../models/User");
const bcrypt = require("bcrypt");
const moment = require("moment");

exports.createMember = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;
  if (!valueRequired(req.body.partner)) delete req.body.partner;

  if (req.userRole === "partner") {
    const user = await Members.findById(req.userId);
    if (user) req.body.partner = user.partner;
  }

  if (req.body.partner === null || req.body.partner === "null") {
    req.body.partner = null;
  }

  if (!req.body.localtion) {
    delete req.body.location;
  }

  const uniqueEmail = await Members.find({
    email: req.body.email,
  });

  if (uniqueEmail.length >= 1) {
    throw new MyError("Имэйл хаяг давхацсан байна", 404);
  }

  const member = await Members.create(req.body);
  res.status(200).json({
    success: true,
    data: member,
  });
});

exports.logout = asyncHandler(async (req, res, next) => {
  const cookieOption = {
    expires: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    httpOnly: false,
  };
  res.status(200).cookie("nodetoken", null, cookieOption).json({
    success: true,
    data: "logout...",
  });
});

exports.checkToken = asyncHandler(async (req, res) => {
  const token = req.cookies;

  if (!token || (token && !token.nodetoken)) {
    const cookieOption = {
      expires: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      httpOnly: false,
    };
    res.status(400).cookie("nodetoken", null, cookieOption).json({
      success: false,
      data: "logout...",
    });
    // throw new MyError("Уучлаарай хандах боломжгүй байна..", 400);
  }

  const tokenObject = jwt.verify(token.nodetoken, process.env.JWT_SECRET);

  const user = await Members.findById(tokenObject.id).select("-password");

  res.status(200).json({
    success: true,
    user,
  });
});

exports.registerMember = asyncHandler(async (req, res) => {
  const userInput = req.body;
  userInput.status = false;

  if (valueRequired(userInput.email)) {
    const uniqueEmail = await Members.find({
      email: userInput["email"].toLowerCase(),
    });
    if (uniqueEmail && uniqueEmail.length >= 1)
      throw new MyError("Имэйл хаяг бүртгэлтэй байна.", 400);
  }

  if (valueRequired(userInput.phoneNumber)) {
    const uniquePhoneNumber = await Members.find({
      phoneNumber: userInput["phoneNumber"],
    });
    if (uniquePhoneNumber && uniquePhoneNumber >= 1)
      throw new MyError("Утасны дугаар бүртгэлтэй байна.", 400);
  }

  const member = await Members.create(userInput);
  const jwt = member.getJsonWebToken();

  res.status(200).json({
    success: true,
    token: jwt,
    data: member,
  });
});

exports.getMembers = asyncHandler(async (req, res, next) => {
  let partnerId = null;

  if (req.memberTokenIs && req.isMember && req.userRole === "user") {
    throw new MyError("Хандах эрхгүй байна.", 400);
  }

  if (req.memberTokenIs && req.isMember && req.userRole === "partner") {
    const member = await Members.findById(req.userId);
    if (!member.partner) {
      throw new MyError("Хандах эрхгүй байна.", 400);
    }
    partnerId = member.partner;
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 24;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;
  const q = req.query.q;

  //  FIELDS
  const userInputs = req.query;
  const fields = ["name", "about", "position", "phoneNumber", "email"];
  const categories = req.query.categories;
  const category = req.query.category;
  const partner = req.query.partner;
  const partnerGet = req.query.partnerGet;
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;
  let status = req.query.status || null;
  let memberShip = req.query.memberShip;
  const name = req.query.name;

  const query = Members.find();

  if (valueRequired(q)) {
    query.where({ memberShip: true });
    query.where({
      $or: [{ name: RegexOptions(q) }, { position: RegexOptions(q) }],
    });
  }

  if (valueRequired(partnerGet)) {
    query.where("partner").in(partnerGet);
  }

  if (valueRequired(status)) {
    if (typeof status !== "boolean" && status.split(",").length > 1) {
      query.where("status").in(status.split(","));
    } else query.where("status").equals(status);
  }

  if (valueRequired(memberShip) && !valueRequired(q)) {
    if (memberShip.split(",").length > 1) {
      query.where("memberShip").in(memberShip.split(","));
    } else {
      if (typeof memberShip == "string") {
        memberShip =
          memberShip === "true" ? true : memberShip === "false" && false;
      }

      query.where("memberShip").equals(memberShip);
    }
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

  if (valueRequired(categories)) {
    const arrayList = categories.split(",");
    query.where("category").in(arrayList);
  }

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

  if (valueRequired(name)) {
    query.where({ name: RegexOptions(name) });
  }

  if (valueRequired(partner)) {
    const partnerData = await Partner.find({
      name: RegexOptions(partner),
    }).select("_id");
    if (partnerData.length > 0) query.where("partner").in(partnerData);
  }

  if (valueRequired(sort)) {
    if (typeof sort === "string") {
      const spliteSort = sort.split(":");
      let convertSort = { createAt: -1 };
      if (spliteSort[1] === "ascend") {
        convertSort = { [spliteSort[0]]: 1 };
      } else if (spliteSort[1] === "descend") {
        convertSort = { [spliteSort[0]]: -1 };
      }
      if (spliteSort[0] != "undefined") query.sort(convertSort);
      else query.sort(convertSort);
    } else {
      query.sort(sort);
    }
  }

  query.select(select);
  query.populate("createUser");
  query.populate("updateUser");
  query.populate("partner");
  query.populate("category");

  query.populate({
    path: "rating", // Use the path to the virtual property
    options: { localField: "_id", foreignField: "member" }, // Provide localField and foreignField options
  });

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Members, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  let members = await query.exec();

  for (const member of members) {
    const countRating = await MemberRate.find({ member: member._id }).count();
    if (countRating === 0) {
      member.rating = 0; // Default value if there are no ratings
    } else {
      member.ratingCount = countRating;
      const r5 = await MemberRate.find({ member: member._id, rate: 5 }).count();
      const r4 = await MemberRate.find({ member: member._id, rate: 4 }).count();
      const r3 = await MemberRate.find({ member: member._id, rate: 3 }).count();
      const r2 = await MemberRate.find({ member: member._id, rate: 2 }).count();
      const r1 = await MemberRate.find({ member: member._id, rate: 1 }).count();

      const averageRating =
        (5 * r5 + 4 * r4 + 3 * r3 + 2 * r2 + 1 * r1) / (r1 + r2 + r3 + r4 + r5);

      member.rating = parseInt(averageRating);
    }
  }

  if (req.memberTokenIs && req.isMember && req.userRole === "member") {
    const result = await Members.findById(req.userId);
    members = [result];
  }

  res.status(200).json({
    success: true,
    count: members.length,
    data: members,
    pagination,
  });
});

exports.getTopRateMembers = asyncHandler(async (req, res) => {
  const userInputs = req.query;
  const query = {
    memberShip: true,
  };

  if (valueRequired(userInputs["categories"])) {
    const array = await MemberCategories.find()
      .where("_id")
      .in(userInputs["categories"].split(","))
      .select("_id");

    query["category"] = { $in: array.map((el) => el._id) };
  }

  const members = await Members.aggregate([
    { $match: query },

    // Rating мэдээлэл татах
    {
      $lookup: {
        from: "memberrates",
        localField: "_id",
        foreignField: "member",
        as: "ratings",
      },
    },

    // Онооны тооцоолол
    {
      $addFields: {
        ratingCount: { $size: "$ratings" },
        rating5Count: {
          $size: {
            $filter: {
              input: "$ratings",
              as: "rate",
              cond: { $eq: ["$$rate.rate", 5] },
            },
          },
        },
      },
    },

    {
      $addFields: {
        rating5Percent: {
          $cond: [
            { $gt: ["$ratingCount", 0] },
            {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$rating5Count", "$ratingCount"] },
                    100,
                  ],
                },
                1,
              ],
            },
            0,
          ],
        },
      },
    },

    // ✅ Category populate хийх
    {
      $lookup: {
        from: "membercategories", // collection name (бага үсгээр, олон тоон дээр)
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Санамсаргүй 20 гишүүн авах
    { $sample: { size: 20 } },
  ]);

  res.status(200).json({
    success: true,
    count: members.length,
    data: members,
  });
});

exports.getRateMember = asyncHandler(async (req, res) => {
  const userInputs = req.query;
  const query = {};

  if (valueRequired(userInputs["categories"])) {
    const array = await MemberCategories.find()
      .where("_id")
      .in(userInputs["categories"].split(","))
      .select("_id");
    query["category"] = { $in: array.map((el) => el._id) };
  }

  const members = await Members.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "memberrates",
        localField: "_id",
        foreignField: "member",
        as: "ratings",
      },
    },
    {
      $addFields: {
        rating: {
          $avg: "$ratings.rate", // Calculate average of 'value' field in ratings array
        },
        ratingCount: { $size: "$ratings" }, // Calculate the count of ratings
      },
    },
    {
      $sort: { ratingCount: -1, rating: -1 }, // Sort by averageRating in descending order
    },
    { $limit: 10 },
  ]);

  for (const member of members) {
    const countRating = await MemberRate.find({ member: member._id }).count();
    if (countRating === 0) {
      member.rating = 0; // Default value if there are no ratings
    } else {
      const r5 = await MemberRate.find({ member: member._id, rate: 5 }).count();
      const r4 = await MemberRate.find({ member: member._id, rate: 4 }).count();
      const r3 = await MemberRate.find({ member: member._id, rate: 3 }).count();
      const r2 = await MemberRate.find({ member: member._id, rate: 2 }).count();
      const r1 = await MemberRate.find({ member: member._id, rate: 1 }).count();

      const averageRating =
        (5 * r5 + 4 * r4 + 3 * r3 + 2 * r2 + 1 * r1) / (r1 + r2 + r3 + r4 + r5);

      member.rating = parseInt(averageRating);
    }
  }

  res.status(200).json({
    success: true,
    data: members,
  });
});

exports.getFullData = asyncHandler(async (req, res, next) => {
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  //  FIELDS
  const userInputs = req.query;
  const fields = ["name", "about", "position", "phoneNumber", "email"];
  const createUser = req.query.createUser;
  const updateUser = req.query.updateUser;

  const query = Members.find();

  fields.map((field) => {
    if (valueRequired(userInputs[field])) {
      const arrayList = userInputs[field].split(",");
      if (arrayList > 1) query.find({ [field]: { $in: arrayList } });
      else query.find({ [field]: RegexOptions(userInputs[field]) });
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
  const member = await Members.findById(req.params.id)
    .populate("createUser")
    .populate("updateUser")
    .populate("partner")
    .populate("category");

  if (
    req.userRole !== "partner" &&
    req.memberTokenIs === true &&
    req.isMember === true &&
    req.userId !== req.params.id
  ) {
    throw new MyError("Хандах эрхгүй байна", 400);
  }

  const user = await Members.findById(req.userId);
  const memberData = await Members.findById(req.params.id);

  if (
    req.userRole === "partner" &&
    !memberData.partner &&
    user.partner.toString() !== memberData.partner.toString()
  ) {
    throw new MyError("Хандах эрхгүй байна", 400);
  }

  let alternativeMembers = [];
  if (!member) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }
  let ratingStats = {};

  const countRating = await MemberRate.find({ member: member._id }).count();
  if (countRating === 0) {
    member.rating = 0; // Default value if there are no ratings
  } else {
    const r5 = await MemberRate.find({ member: member._id, rate: 5 }).count();
    const r4 = await MemberRate.find({ member: member._id, rate: 4 }).count();
    const r3 = await MemberRate.find({ member: member._id, rate: 3 }).count();
    const r2 = await MemberRate.find({ member: member._id, rate: 2 }).count();
    const r1 = await MemberRate.find({ member: member._id, rate: 1 }).count();

    const ratingCount = r1 + r2 + r3 + r4 + r5;
    const averageRating = ratingCount
      ? ((5 * r5 + 4 * r4 + 3 * r3 + 2 * r2 + 1 * r1) / ratingCount).toFixed(2)
      : 0;

    member.rating = averageRating;
    member.ratingCount = ratingCount;

    ratingStats = { 5: r5, 4: r4, 3: r3, 2: r2, 1: r1 };
  }

  const ratingCount = await MemberRate.find({ member: member._id }).count();

  member.ratingCount = ratingCount;

  if (valueRequired(member.partner)) {
    alternativeMembers = await Members.find({})
      .where("partner")
      .in(member.partner);
  }

  res.status(200).json({
    success: true,
    data: member,
    alternativeMembers,
    ratingStats,
  });
});

exports.updateMember = asyncHandler(async (req, res, next) => {
  let member = await Members.findById(req.params.id);

  if (!member) {
    throw new MyError("Тухайн өгөгдөл олдсонгүй. ", 404);
  }

  if (!valueRequired(req.body.partner)) {
    req.body.partner = null;
  }

  if (
    req.userRole !== "partner" &&
    req.memberTokenIs === true &&
    req.isMember === true &&
    req.userId !== req.params.id
  ) {
    throw new MyError("Хандах эрхгүй байна", 400);
  }

  if (req.memberTokenIs && req.isMember && req.userRole === "partner") {
    delete req.body.partner;
    const user = await Members.findById(req.userId);
    if (user && member.partner.toString() === user.partner.toString()) {
    }
  }

  if (req.userFront) {
  } else {
    req.body.updateUser = req.userId;
  }

  req.body.updateAt = Date.now();

  if (req.body.picture && req.body.length > 1) {
    if (valueRequired(req.body.category) === false) {
      req.body.category = [];
    }

    if (valueRequired(req.body.partner) === false) {
      req.body.partner = null;
    }
  }

  if (typeof req.body.location === "string") {
    try {
      req.body.location = JSON.parse(req.body.location);
    } catch (err) {
      console.log("location parse error", err);
      delete req.body.location;
    }
  }

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

exports.login = asyncHandler(async (req, res, next) => {
  let { email, password, phoneNumber } = req.body;

  // Оролтын утгуудыг шалгах
  if (!email && !phoneNumber) {
    throw new MyError("Имэйл эсвэл утасны дугаар оруулна уу", 400);
  }

  if (!password) {
    throw new MyError("Нууц үгээ оруулна уу", 400);
  }

  if (email) {
    email = email.toLowerCase();
  }

  // Тухайн хэрэглэгчийг хайх
  let user = null;
  if (email) {
    user = await Members.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    }).select("+password");
  } else if (phoneNumber) {
    user = await Members.findOne({ phoneNumber }).select("+password");
  }

  if (!user) {
    throw new MyError("Хэрэглэгч олдсонгүй", 404);
  }

  // Нууц үгийг шалгах
  if (!user.password) {
    throw new MyError("Нууц үг олдсонгүй", 401);
  }

  const ok = await user.checkPassword(password);

  if (!ok) {
    throw new MyError("Нууц үг буруу байна", 401);
  }

  // Токен үүсгэх
  const token = user.getJsonWebToken();
  req.token = token;

  const cookieOption = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: false,
  };

  res.status(200).cookie("nodetoken", token, cookieOption).json({
    success: true,
    token,
    user,
  });
});

exports.forgetPasswordChange = asyncHandler(async (req, res) => {
  const resetToken = req.body.resetToken;
  const password = req.body.password;
  const confirm = req.body.confirm;

  if (!valueRequired(resetToken)) {
    throw new MyError("Хандах эрхгүй байна.", 400);
  }

  const member = await Members.findOne({ resetPasswordToken: resetToken });

  if (!member) {
    throw new MyError("Хандах эрхгүй байна.", 400);
  }

  let user = await Members.findById(member._id);

  console.log(user);

  if (password !== confirm) {
    throw new MyError("Нууц үг тохиорохгүй байна", 400);
  }

  user.password = req.body.password;
  user.resetPassword = undefined;
  user.resetPasswordExpire = undefined;
  user.updateAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

exports.resetTokenCheck = asyncHandler(async (req, res) => {
  const { resetToken } = req.body;
  if (!valueRequired(resetToken)) {
    throw new MyError("Хандах эрхгүй байна.", 400);
  }

  const member = await Members.findOne({
    resetPasswordToken: resetToken,
  });

  if (
    !valueRequired(member) ||
    new Date(Date.now()) >= member.resetPasswordExpire
  ) {
    const resetPasswordToken = undefined;
    const resetPasswordExpire = undefined;
    await Members.findByIdAndUpdate(member._id, {
      resetPasswordToken,
      resetPasswordExpire,
    });
    throw new MyError(
      "Нууц үг сэргээх хугацаа дууссан байна дахин имэйлээр авна уу.",
      400
    );
  }

  res.status(200).json({
    success: true,
  });
});

exports.sendPassword = asyncHandler(async (req, res) => {
  const userInputs = req.body;

  if (valueRequired(userInputs.email)) {
    const email = userInputs.email.toLowerCase();
    const memberCheck = await Members.find({ email: email });
    if (!memberCheck || memberCheck.length <= 0) {
      throw new MyError("Та бүртгэлгүй байна.", 404);
    }
  } else {
    throw new MyError("Имэйл хаягаа оруулна уу", 400);
  }

  const member = await Members.findOne({
    email: userInputs.email.toLowerCase(),
  });

  if (new Date(Date.now()) < member.resetPasswordExpire) {
    const resetPasswordToken = undefined;
    const resetPasswordExpire = undefined;
    await Members.findByIdAndUpdate(member._id, {
      resetPasswordToken,
      resetPasswordExpire,
    });
    throw new MyError("Имэйл хаягт илгээсэн байна", 400);
  }

  const rndNumber = 100000 + Math.floor(Math.random() * 900000);
  const salt = await bcrypt.genSalt(10);
  const a = await bcrypt.hash(rndNumber + "", salt);

  const resetPasswordToken = a
    .replaceAll(/^\s+|\s+$|\n|\t|,/gm, "")
    .replaceAll("/", "")
    .replaceAll(".", "")
    .replaceAll("&", "")
    .replaceAll("$", "")
    .replaceAll("?", "");

  const resetPasswordExpire = new Date(Date.now() + 1000 * 60);

  const data = {
    email: userInputs.email.toLowerCase(),
    subject: "Нууц үг сэргээх (node.mn)",
    text: "Нууц үг сэргээх",
    html: `Нууц үг сэргээх линк: <a href="${process.env.SITE}forget/${resetPasswordToken}"> ${process.env.SITE}forget/${resetPasswordToken} </a>`,
  };

  const result = await sendEmail({ ...data });

  const memberResult = await Members.findByIdAndUpdate(member._id, {
    resetPasswordToken,
    resetPasswordExpire,
  });

  res.status(200).json({
    success: true,
    result,
  });
});

exports.changeMemberPassword = asyncHandler(async (req, res) => {
  const oldPassword = req.body.oldPassword;
  const password = req.body.password;
  const confirm = req.body.confirm;

  let user = await Members.findById(req.userId).select("+password");

  if (!user) {
    throw new MyError("Хандах эрхгүй байна.", 400);
  }

  if (password !== confirm) {
    throw new MyError("Нууц үг тохиорохгүй байна", 400);
  }

  const ok = await user.checkPassword(oldPassword);

  if (!ok) {
    throw new MyError("Нууц үг буруу байна", 402);
  }

  user.password = req.body.password;
  user.resetPassword = undefined;
  user.resetPasswordExpire = undefined;
  user.updateAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const newPassword = req.body.password;
  const userId = req.body.id;

  if (req.memberTokenIs && req.isMember && req.userRole === "user") {
    throw new MyError("Хандах эрхгүй байна.", 400);
  }

  if (req.memberTokenIs && req.isMember && req.userRole === "partner") {
    const member = await Members.findById(req.userId);
    if (!member.partner) {
      throw new MyError("Хандах эрхгүй байна.", 400);
    }
  }

  if (!newPassword) {
    throw new MyError("Нууц үгээ дамжуулна уу.", 400);
  }

  const user = await Members.findById(userId);

  if (!user) {
    throw new MyError(req.body.email + "Хандах боломжгүй.", 400);
  }

  user.password = req.body.password;
  user.resetPassword = undefined;
  user.resetPasswordExpire = undefined;
  user.updateAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});
