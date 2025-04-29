const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Pega o token do cabeçalho
    token = req.headers.authorization.split(" ")[1];
  }

  // Verifica se o token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Não autorizado para acessar esta rota",
    });
  }

  try {
    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Não autorizado para acessar esta rota",
    });
  }
};
