const bcrypt = require("bcryptjs");

const { AppError } = require("../../common/AppError");
const { registerLog } = require("../../common/logService");
const usersRepository = require("./users.repository");

async function listUsers() {
  return usersRepository.listUsers();
}

async function createUser(data, currentUserId) {
  const exists = await usersRepository.findByEmail(data.email);
  if (exists) {
    throw new AppError("Email ja cadastrado", 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await usersRepository.createUser({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
    active: data.active ?? true,
  });

  await registerLog({
    entity: "users",
    entityId: user.id,
    action: "create",
    payload: user,
    userId: currentUserId,
  });

  return user;
}

async function createBootstrapUser(data) {
  const usersCount = await usersRepository.countUsers();
  if (usersCount > 0) {
    throw new AppError("Bootstrap desabilitado: ja existe usuario cadastrado", 409);
  }

  return createUser(
    {
      ...data,
      role: data.role || "admin",
      active: data.active ?? true,
    },
    null
  );
}

async function updateUser(id, data, currentUser) {
  const existing = await usersRepository.findById(id);
  if (!existing) {
    throw new AppError("Usuario nao encontrado", 404);
  }

  const isAdmin = currentUser?.role === "admin";
  const isOwnProfile = String(currentUser?.id) === String(id);

  if (!isAdmin && !isOwnProfile) {
    throw new AppError("Sem permissao para atualizar este usuario", 403);
  }

  if (!isAdmin) {
    if (data.role !== undefined || data.active !== undefined) {
      throw new AppError("Somente admin pode alterar perfil e status", 403);
    }

    const currentPassword = String(data.currentPassword || "");
    if (!currentPassword) {
      throw new AppError("Senha atual obrigatoria para atualizar usuario", 400);
    }

    const ok = await bcrypt.compare(currentPassword, existing.passwordHash);
    if (!ok) {
      throw new AppError("Senha atual invalida", 401);
    }
  }

  if (data.email && data.email !== existing.email) {
    const emailTaken = await usersRepository.findByEmail(data.email);
    if (emailTaken) {
      throw new AppError("Email ja cadastrado", 409);
    }
  }

  const payload = {
    name: data.name,
    email: data.email,
    role: data.role,
    active: data.active,
  };

  if (data.password) {
    payload.passwordHash = await bcrypt.hash(data.password, 10);
  }

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

  const user = await usersRepository.updateUser(id, payload);

  await registerLog({
    entity: "users",
    entityId: id,
    action: "update",
    payload,
    userId: currentUser?.id || null,
  });

  return user;
}

async function deactivateUser(id, currentUser) {
  const existing = await usersRepository.findById(id);
  if (!existing) {
    throw new AppError("Usuario nao encontrado", 404);
  }

  const user = await usersRepository.updateUser(id, { active: false });

  await registerLog({
    entity: "users",
    entityId: id,
    action: "deactivate",
    payload: { active: false },
    userId: currentUser?.id || null,
  });

  return user;
}

module.exports = {
  listUsers,
  createBootstrapUser,
  createUser,
  updateUser,
  deactivateUser,
};
