const bcrypt = require("bcryptjs");

const { AppError } = require("../../common/AppError");
const { signToken } = require("../../common/jwt");
const authRepository = require("./auth.repository");

async function login({ email, password } = {}) {
    console.error("authService.login called with:", { email, password }); // Log para depuração
  const normalizedEmail = String(email || "").trim();
  const plainPassword = String(password || "");

  if (!normalizedEmail || !plainPassword) {
    throw new AppError("Email e senha sao obrigatorios", 400);
  }

  const user = await authRepository.findUserByEmail(normalizedEmail);
  console.log("User found for login:", user); // Log para depuração

  if (!user || !user.active) {
    throw new AppError("Credenciais invalidas", 401);
  }

  const ok = await bcrypt.compare(plainPassword, user.passwordHash);
  if (!ok) {
    throw new AppError("Credenciais invalidas", 401);
  }

  const token = signToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    },
  };
}

module.exports = { login };
