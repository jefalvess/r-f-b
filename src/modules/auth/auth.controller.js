const authService = require("./auth.service");

async function login(req, res, next) {
  try {
    const result = await authService.login(req.validated.body);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = { login };
