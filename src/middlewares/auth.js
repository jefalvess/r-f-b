const { AppError } = require("../common/AppError");
const { verifyToken } = require("../common/jwt");

function ensureAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new AppError("Token nao informado", 401));
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new AppError("Formato de token invalido", 401));
  }

  const decoded = verifyToken(token);
  req.user = {
    id: decoded.sub,
    role: decoded.role,
    email: decoded.email,
  };

  return next();
}

function ensureRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Usuario nao autenticado", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Sem permissao para acessar este recurso", 403));
    }

    return next();
  };
}

module.exports = { ensureAuth, ensureRole };
