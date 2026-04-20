const { Router } = require("express");

const { ensureAuth, ensureRole } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/validate");
const usersController = require("./users.controller");
const { createUserSchema, createBootstrapUserSchema, updateUserSchema, userIdSchema } = require("./users.schema");

const router = Router();

router.post("/users/bootstrap", validate(createBootstrapUserSchema), usersController.createBootstrapUser);

router.get("/users", usersController.listUsers);
router.post("/users", validate(createUserSchema), usersController.createUser);
router.delete("/users/:id", validate(userIdSchema), usersController.deleteUser);

module.exports = router;
