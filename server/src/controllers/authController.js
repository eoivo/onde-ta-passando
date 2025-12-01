const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sendPasswordResetEmail, sendWelcomeEmail, testEmailConnection, sendTestEmail } = require("../config/email");

// Função para validar senha forte
const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("A senha deve ter no mínimo 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("A senha deve conter pelo menos uma letra maiúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("A senha deve conter pelo menos um número");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// @desc    Registrar usuário
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validar senha forte
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.errors.join(". "),
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Este email já está em uso",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    // Enviar email de boas-vindas de forma assíncrona (não bloqueia o cadastro)
    sendWelcomeEmail(user.email, user.name)
      .then(() => {
        console.log(`Email de boas-vindas enviado com sucesso para: ${user.email}`);
      })
      .catch((emailError) => {
        console.error("Erro ao enviar email de boas-vindas:", emailError);
        // Não bloqueia o cadastro se o email falhar
      });

    // Retornar sucesso sem token (usuário precisa fazer login)
    res.status(201).json({
      success: true,
      message: "Conta criada com sucesso! Verifique seu email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login do usuário
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Por favor, forneça um email e senha",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Obtém usuário atual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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

// @desc    Logout do usuário / limpa cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {},
  });
};

// @desc    Esqueci minha senha
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Por favor, forneça um email",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      return res.status(200).json({
        success: true,
        message: "Se o email existir, você receberá um link de redefinição",
      });
    }

    // Gerar token de reset
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Enviar email de forma assíncrona (não bloquear a resposta)
    sendPasswordResetEmail(user.email, resetToken)
      .then(() => {
        console.log(`Email de reset enviado com sucesso para: ${user.email}`);
      })
      .catch((error) => {
        console.error("Erro ao enviar email de reset:", error);
        // Limpar token se falhar
        User.findByIdAndUpdate(
          user._id,
          {
            resetPasswordToken: undefined,
            resetPasswordExpire: undefined,
          },
          { validateBeforeSave: false }
        ).catch((err) => {
          console.error("Erro ao limpar token:", err);
        });
      });

    // Responder imediatamente ao frontend
    res.status(200).json({
      success: true,
      message: "Se o email existir, você receberá um link de redefinição",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Redefinir senha
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const resetToken = req.params.resettoken;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Por favor, forneça uma nova senha",
      });
    }

    // Validar senha forte
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.errors.join(". "),
      });
    }

    // Hash do token recebido
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Buscar usuário com token válido e não expirado
    // Incluir password no select para comparar
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token inválido ou expirado",
      });
    }

    // Verificar se a nova senha é diferente da atual
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "A nova senha deve ser diferente da senha atual",
      });
    }

    // Definir nova senha
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Retornar sucesso sem token (usuário precisa fazer login)
    res.status(200).json({
      success: true,
      message: "Senha redefinida com sucesso! Faça login com sua nova senha.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

// @desc    Testar envio de email
// @route   POST /api/auth/test-email
// @access  Private
exports.testEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Por favor, forneça um email para teste",
      });
    }

    // Testar conexão primeiro
    const connectionTest = await testEmailConnection();
    console.log("Teste de conexão:", connectionTest);

    // Enviar email de teste
    const testResult = await sendTestEmail(email);

    if (testResult.success) {
      return res.status(200).json({
        success: true,
        message: testResult.message,
        connectionTest: connectionTest.message,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: testResult.message,
        connectionTest: connectionTest.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
