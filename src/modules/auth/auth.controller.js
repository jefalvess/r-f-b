const authService = require("./auth.service");

async function login(req, res, next) {
  try {
    const { authorization } = req.headers || {};
    const refreshCandidate = authorization;

    if (refreshCandidate) {
      try {
        const refreshed = await authService.refreshByToken(refreshCandidate);
        return res.json(refreshed);
      } catch (refreshError) {
        // eslint-disable-next-line no-console
        console.error("Falha ao atualizar token:", refreshError);
        // Continuar para tentar o login normal
      }
    }

    const { userName, password } = req.body || {};

    const result = await authService.login({ userName, password });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = { login };
