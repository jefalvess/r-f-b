const { User } = require("../../models");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findUserByEmail(userName) {
  const normalizedEmail = String(userName || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  // Busca direta (mais performatica)
  const exactMatch = await User.findOne({ userName: normalizedEmail });
  if (exactMatch) {
    return exactMatch;
  }

  // Fallback para dados antigos com caixa diferente
  return User.findOne({
    userName: { $regex: new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i") },
  });
}

async function findUserById(id) {
  if (!id) {
    return null;
  }

  return User.findById(id);
}

module.exports = { findUserByEmail, findUserById };
