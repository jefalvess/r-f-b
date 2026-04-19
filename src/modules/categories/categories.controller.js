const service = require("./categories.service");

async function list(req, res, next) {
  try {
    return res.json(await service.listCategories());
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    return res.status(201).json(await service.createCategory(req.validated.body, req.user.id));
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    return res.json(await service.updateCategory(req.validated.params.id, req.validated.body, req.user.id));
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    return res.json(await service.deleteCategory(req.validated.params.id, req.user.id));
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, create, update, remove };
