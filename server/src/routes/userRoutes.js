const express = require("express");
const {
  updateProfile,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  addToWatched,
  removeFromWatched,
  getWatched,
  uploadProfileImage
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(protect);

// Rotas de perfil
router.put("/profile", updateProfile);
router.post("/profile-image", uploadProfileImage);

// Rotas de favoritos
router.post("/favorites", addToFavorites);
router.delete("/favorites/:mediaType/:id", removeFromFavorites);
router.get("/favorites", getFavorites);

// Rotas de watchlist (assistir mais tarde)
router.post("/watchlist", addToWatchlist);
router.delete("/watchlist/:mediaType/:id", removeFromWatchlist);
router.get("/watchlist", getWatchlist);

// Rotas de watched (já assistidos)
router.post("/watched", addToWatched);
router.delete("/watched/:mediaType/:id", removeFromWatched);
router.get("/watched", getWatched);

module.exports = router;
