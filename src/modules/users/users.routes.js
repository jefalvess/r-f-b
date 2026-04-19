const { Router } = require("express");

const { ensureAuth, ensureRole } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/validate");
const usersController = require("./users.controller");
const { createUserSchema, createBootstrapUserSchema, updateUserSchema, userIdSchema } = require("./users.schema");

const router = Router();

router.post("/users/bootstrap", validate(createBootstrapUserSchema), usersController.createBootstrapUser);

router.use(ensureAuth);

router.get("/users", ensureRole("admin"), usersController.listUsers);
router.post("/users", ensureRole("admin"), validate(createUserSchema), usersController.createUser);
router.put("/users/:id", validate(updateUserSchema), usersController.updateUser);
router.delete("/users/:id", ensureRole("admin"), validate(userIdSchema), usersController.deleteUser);

module.exports = router;
