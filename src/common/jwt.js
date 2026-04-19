const jwt = require("jsonwebtoken");
const { AppError } = require("./AppError");

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT_SECRET nao configurado", 500);
  }

  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    secret,
    { expiresIn: "12h" }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError("Token invalido ou expirado", 401);
  }
}

module.exports = { signToken, verifyToken };
