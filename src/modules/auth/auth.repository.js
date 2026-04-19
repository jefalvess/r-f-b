const { User } = require("../../models");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findUserByEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  // Busca direta (mais performatica)
  const exactMatch = await User.findOne({ email: normalizedEmail });
  if (exactMatch) {
    return exactMatch;
  }

  // Fallback para dados antigos com caixa diferente
  return User.findOne({
    email: { $regex: new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i") },
  });
}

module.exports = { findUserByEmail };
