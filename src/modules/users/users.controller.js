const usersService = require("./users.service");

async function listUsers(req, res, next) {
  try {
    const result = await usersService.listUsers();
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const result = await usersService.createUser(req.validated.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function createBootstrapUser(req, res, next) {
  try {
    const result = await usersService.createBootstrapUser(req.validated.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const result = await usersService.deactivateUser(req.validated.params.id, req.user);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listUsers,
  createBootstrapUser,
  createUser,
  deleteUser,
};
