const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Por favor, adicione um nome"],
    trim: true,
    maxlength: [50, "Nome não pode ter mais de 50 caracteres"],
  },
  email: {
    type: String,
    required: [true, "Por favor, adicione um email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Por favor, adicione um email válido",
    ],
  },
  password: {
    type: String,
    required: [true, "Por favor, adicione uma senha"],
    minlength: [6, "Senha deve ter no mínimo 6 caracteres"],
    select: false,
  },
  profileImage: {
    public_id: {
      type: String,
      default: 'default_profile_image'
    },
    url: {
      type: String,
      default: 'https://res.cloudinary.com/dgawnelu9/image/upload/v1695321871/default-profile_hj3bik.png'
    }
  },
  favorites: {
    movies: [
      {
        id: String,
        title: String,
        poster_path: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tvShows: [
      {
        id: String,
        name: String,
        poster_path: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  watchlist: {
    movies: [
      {
        id: String,
        title: String,
        poster_path: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tvShows: [
      {
        id: String,
        name: String,
        poster_path: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  watched: {
    movies: [
      {
        id: String,
        title: String,
        poster_path: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tvShows: [
      {
        id: String,
        name: String,
        poster_path: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Criptografa a senha antes de salvar
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para gerar JWT Token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Método para verificar a senha
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
