const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const MyError = require("../utils/myError");

exports.memberRoles = asyncHandler(async (req, res, next) => {
  if (req.userRole === "member" || req.userRole === "partner") {
    req.isMember = true;
  } else {
    req.isMember = false;
  }

  next();
});

exports.memberProtect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization) {
    token = req.header.authorization.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies["nodetoken"];
  }

  if (!token) {
    req.memberTokenIs = false;
    // throw new MyError("Уучлаарай хандах боломжгүй байна..", 400);
  } else {
    const tokenObject = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = tokenObject.id;
    req.userRole = tokenObject.role;
    req.memberTokenIs = true;
  }
  next();
});
