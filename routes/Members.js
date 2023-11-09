const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  updateMember,
  createMember,
  getMembers,
  multDeleteMember,
  getMember,
  getRateMember,
  login,
  changePassword,
  registerMember,
  logout,
  checkToken,
} = require("../controller/Members");
const { memberRoles, memberProtect } = require("../middleware/memberRoles");

router
  .route("/")
  .post(
    protect,
    authorize("admin", "operator", "partner"),
    memberProtect,
    memberRoles,
    createMember
  )
  .get(memberProtect, memberRoles, getMembers);

router.route("/check").post(checkToken);
router.route("/logout").get(logout);
router.route("/register").post(registerMember);

router.route("/rate").get(getRateMember);
router.route("/login").post(login);

router
  .route("/delete")
  .delete(
    protect,
    authorize("admin", "partner"),
    memberProtect,
    memberRoles,
    multDeleteMember
  );

router
  .route("/changepassword")
  .post(
    protect,
    authorize("admin", "partner", "member"),
    memberRoles,
    changePassword
  );

router
  .route("/:id")
  .get(memberProtect, memberRoles, getMember)
  .put(
    protect,
    authorize("admin", "operator", "partner", "member"),
    memberRoles,
    memberProtect,
    updateMember
  );

module.exports = router;
