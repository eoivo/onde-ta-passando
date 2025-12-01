const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  testEmail,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.get("/me", protect, getMe);
router.get("/logout", logout);
router.post("/test-email", protect, testEmail); // Rota de teste (requer autenticação)
router.post("/test-email-public", testEmail); // Rota de teste pública (temporária para debug)

module.exports = router;
