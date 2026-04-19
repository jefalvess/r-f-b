const { Router } = require("express");

const { validate } = require("../../middlewares/validate");
const authController = require("./auth.controller");
const { loginSchema } = require("./auth.schema");

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/auth/login", validate(loginSchema), authController.login);

module.exports = router;
