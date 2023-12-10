const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { valueRequired } = require("../lib/check");
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

  if (
    valueRequired(req.query.usersearch) &&
    (req.query.usersearch == true || req.query.usersearch == "true")
  ) {
    req.userFront = true;
  } else {
    req.userFront = false;
  }

  if (!token || !valueRequired(token)) {
    req.memberTokenIs = false;
    // throw new MyError("Уучлаарай хандах боломжгүй байна..", 400);
  } else {
    try {
      const tokenObject = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = tokenObject.id;
      req.memberRole = tokenObject.role;
      // req.userFront = tokenObject.userFront || false;
    } catch {
      next();
    }
  }
  next();
});
