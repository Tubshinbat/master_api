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
  changeMemberPassword,
  registerMember,
  logout,
  checkToken,
  sendPassword,
  resetTokenCheck,
  forgetPasswordChange,
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
  .get(getMembers);

router.route("/getmembers").get(memberProtect, memberRoles, getMembers);
router
  .route("/memberpasswordchange")
  .put(memberProtect, memberRoles, changeMemberPassword);

router.route("/check").post(checkToken);
router.route("/logout").get(logout);
router.route("/register").post(registerMember);

router.route("/rate").get(getRateMember);
router.route("/login").post(login);

router
  .route("/delete")
  .delete(protect, authorize("admin", "partner"), multDeleteMember);

router
  .route("/changepassword")
  .post(
    protect,
    authorize("admin", "partner", "member"),
    memberRoles,
    changePassword
  );

router.route("/forget").post(sendPassword);
router.route("/forgetpasswordchange").post(forgetPasswordChange);
router.route("/resetToken").post(resetTokenCheck);

router
  .route("/:id")
  .get(getMember)
  .put(
    protect,
    authorize("admin", "operator", "partner", "member"),
    memberRoles,
    memberProtect,
    updateMember
  );

module.exports = router;
