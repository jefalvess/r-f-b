const { Router } = require("express");

const authRoutes = require("../modules/auth/auth.routes");
const usersRoutes = require("../modules/users/users.routes");
const categoriesRoutes = require("../modules/categories/categories.routes");
const productsRoutes = require("../modules/products/products.routes");
const ordersRoutes = require("../modules/orders/orders.routes");
const reportsRoutes = require("../modules/reports/reports.routes");

const router = Router();

router.use(authRoutes);
router.use(usersRoutes);
router.use(categoriesRoutes);
router.use(productsRoutes);
router.use(ordersRoutes);
router.use(reportsRoutes);

module.exports = router;
