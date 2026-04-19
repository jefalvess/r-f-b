const { User } = require("../../models");

async function listUsers() {
  return User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 });
}

async function createUser(data) {
  const user = new User(data);
  await user.save();
  return user.toObject({ versionKey: false, transform: (doc, ret) => { delete ret.passwordHash; return ret; } });
}

async function findById(id) {
  return User.findById(id);
}

async function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

async function countUsers() {
  return User.countDocuments({});
}

async function updateUser(id, data) {
  const user = await User.findByIdAndUpdate(id, data, { new: true });
  return user.toObject({ versionKey: false, transform: (doc, ret) => { delete ret.passwordHash; return ret; } });
}

module.exports = {
  listUsers,
  createUser,
  findById,
  findByEmail,
  countUsers,
  updateUser,
};
