const bcrypt = require("bcryptjs");

const { AppError } = require("../../common/AppError");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../../common/jwt");
const authRepository = require("./auth.repository");

function buildAuthResponse(user) {
  const token = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    token,
    accessToken: token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      userName: user.userName,
      role: user.role,
      active: user.active,
    },
  };
}

async function login({ userName, password } = {}) {
  const normalizedEmail = String(userName || "").trim();
  const plainPassword = String(password || "");

  if (!normalizedEmail || !plainPassword) {
    throw new AppError("Email e senha sao obrigatorios", 400);
  }

  const user = await authRepository.findUserByEmail(normalizedEmail);

  if (!user || !user.active) {
    throw new AppError("Credenciais invalidas", 401);
  }

  const ok = await bcrypt.compare(plainPassword, user.passwordHash);
  if (!ok) {
    throw new AppError("Credenciais invalidas", 401);
  }

  return buildAuthResponse(user);
}

async function refreshByToken(refreshToken) {
  const normalizedToken = String(refreshToken || "").trim();
  const token = normalizedToken.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    throw new AppError("Refresh token nao informado", 401);
  }

  const decoded = verifyRefreshToken(token);
  const user = await authRepository.findUserById(decoded.sub);

  if (!user || !user.active) {
    throw new AppError("Usuario invalido para refresh", 401);
  }

  return buildAuthResponse(user);
}

module.exports = { login, refreshByToken };
