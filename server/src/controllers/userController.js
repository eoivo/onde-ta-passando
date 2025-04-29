const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// @desc    Atualizar informações do usuário
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Verifica se o email já está em uso por outro usuário
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: "Este email já está em uso",
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Adicionar filme/série aos favoritos
// @route   POST /api/users/favorites
// @access  Private
exports.addToFavorites = async (req, res) => {
  try {
    const { id, title, name, poster_path, mediaType } = req.body;

    if (!id || !mediaType || !(mediaType === "movie" || mediaType === "tv")) {
      return res.status(400).json({
        success: false,
        message: "Forneça ID e tipo de mídia válido (movie ou tv)",
      });
    }

    const user = await User.findById(req.user.id);

    // Verifica se o item já está nos favoritos
    if (mediaType === "movie") {
      const existingMovie = user.favorites.movies.find(
        (movie) => movie.id === id
      );
      if (existingMovie) {
        return res.status(400).json({
          success: false,
          message: "Este filme já está nos favoritos",
        });
      }
      user.favorites.movies.push({
        id,
        title,
        poster_path,
      });
    } else {
      const existingShow = user.favorites.tvShows.find(
        (show) => show.id === id
      );
      if (existingShow) {
        return res.status(400).json({
          success: false,
          message: "Esta série já está nos favoritos",
        });
      }
      user.favorites.tvShows.push({
        id,
        name,
        poster_path,
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remover filme/série dos favoritos
// @route   DELETE /api/users/favorites/:mediaType/:id
// @access  Private
exports.removeFromFavorites = async (req, res) => {
  try {
    const { mediaType, id } = req.params;

    if (!(mediaType === "movie" || mediaType === "tv")) {
      return res.status(400).json({
        success: false,
        message: "Tipo de mídia inválido (deve ser movie ou tv)",
      });
    }

    const user = await User.findById(req.user.id);

    if (mediaType === "movie") {
      user.favorites.movies = user.favorites.movies.filter(
        (movie) => movie.id !== id
      );
    } else {
      user.favorites.tvShows = user.favorites.tvShows.filter(
        (show) => show.id !== id
      );
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obter favoritos do usuário
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user.favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Adicionar filme/série à lista de assistir mais tarde
// @route   POST /api/users/watchlist
// @access  Private
exports.addToWatchlist = async (req, res) => {
  try {
    const { id, title, name, poster_path, mediaType } = req.body;

    if (!id || !mediaType || !(mediaType === "movie" || mediaType === "tv")) {
      return res.status(400).json({
        success: false,
        message: "Forneça ID e tipo de mídia válido (movie ou tv)",
      });
    }

    const user = await User.findById(req.user.id);

    // Verifica se o item já está na watchlist
    if (mediaType === "movie") {
      const existingMovie = user.watchlist.movies.find(
        (movie) => movie.id === id
      );
      if (existingMovie) {
        return res.status(400).json({
          success: false,
          message: "Este filme já está na lista de assistir mais tarde",
        });
      }
      user.watchlist.movies.push({
        id,
        title,
        poster_path,
      });
    } else {
      const existingShow = user.watchlist.tvShows.find(
        (show) => show.id === id
      );
      if (existingShow) {
        return res.status(400).json({
          success: false,
          message: "Esta série já está na lista de assistir mais tarde",
        });
      }
      user.watchlist.tvShows.push({
        id,
        name,
        poster_path,
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.watchlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remover filme/série da lista de assistir mais tarde
// @route   DELETE /api/users/watchlist/:mediaType/:id
// @access  Private
exports.removeFromWatchlist = async (req, res) => {
  try {
    const { mediaType, id } = req.params;

    if (!(mediaType === "movie" || mediaType === "tv")) {
      return res.status(400).json({
        success: false,
        message: "Tipo de mídia inválido (deve ser movie ou tv)",
      });
    }

    const user = await User.findById(req.user.id);

    if (mediaType === "movie") {
      user.watchlist.movies = user.watchlist.movies.filter(
        (movie) => movie.id !== id
      );
    } else {
      user.watchlist.tvShows = user.watchlist.tvShows.filter(
        (show) => show.id !== id
      );
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.watchlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obter lista de assistir mais tarde do usuário
// @route   GET /api/users/watchlist
// @access  Private
exports.getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user.watchlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Adicionar filme/série aos assistidos
// @route   POST /api/users/watched
// @access  Private
exports.addToWatched = async (req, res) => {
  try {
    const { id, title, name, poster_path, mediaType } = req.body;

    if (!id || !mediaType || !(mediaType === "movie" || mediaType === "tv")) {
      return res.status(400).json({
        success: false,
        message: "Forneça ID e tipo de mídia válido (movie ou tv)",
      });
    }

    const user = await User.findById(req.user.id);

    // Verifica se o item já está nos assistidos
    if (mediaType === "movie") {
      const existingMovie = user.watched.movies.find(
        (movie) => movie.id === id
      );
      if (existingMovie) {
        return res.status(400).json({
          success: false,
          message: "Este filme já está marcado como assistido",
        });
      }
      user.watched.movies.push({
        id,
        title,
        poster_path,
      });
    } else {
      const existingShow = user.watched.tvShows.find((show) => show.id === id);
      if (existingShow) {
        return res.status(400).json({
          success: false,
          message: "Esta série já está marcada como assistida",
        });
      }
      user.watched.tvShows.push({
        id,
        name,
        poster_path,
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.watched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remover filme/série dos assistidos
// @route   DELETE /api/users/watched/:mediaType/:id
// @access  Private
exports.removeFromWatched = async (req, res) => {
  try {
    const { mediaType, id } = req.params;

    if (!(mediaType === "movie" || mediaType === "tv")) {
      return res.status(400).json({
        success: false,
        message: "Tipo de mídia inválido (deve ser movie ou tv)",
      });
    }

    const user = await User.findById(req.user.id);

    if (mediaType === "movie") {
      user.watched.movies = user.watched.movies.filter(
        (movie) => movie.id !== id
      );
    } else {
      user.watched.tvShows = user.watched.tvShows.filter(
        (show) => show.id !== id
      );
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.watched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obter assistidos do usuário
// @route   GET /api/users/watched
// @access  Private
exports.getWatched = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user.watched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload da imagem de perfil
// @route   POST /api/users/profile-image
// @access  Private
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: "Por favor, envie uma imagem",
      });
    }

    const user = await User.findById(req.user.id);

    // Remover imagem atual do Cloudinary se não for a default
    if (user.profileImage.public_id !== "default_profile_image") {
      await cloudinary.uploader.destroy(user.profileImage.public_id);
    }

    // Upload da nova imagem
    const file = req.files.image;

    // Verificar se é uma imagem
    if (!file.mimetype.startsWith("image")) {
      return res.status(400).json({
        success: false,
        message: "Por favor, envie apenas imagens",
      });
    }

    // Verificar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "A imagem deve ter menos de 2MB",
      });
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "profile_images",
      width: 300,
      height: 300,
      crop: "fill",
    });

    // Remover arquivo temporário
    fs.unlinkSync(file.tempFilePath);

    // Atualizar perfil do usuário
    user.profileImage = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erro ao fazer upload da imagem",
    });
  }
};
