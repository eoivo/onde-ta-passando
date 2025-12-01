const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.get("/me", protect, getMe);
router.get("/logout", logout);

module.exports = router;
