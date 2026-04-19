const { prisma } = require("../../config/prisma");

function parsePeriod(query) {
  const start = query.start ? new Date(query.start) : new Date(new Date().setHours(0, 0, 0, 0));
  const end = query.end ? new Date(query.end) : new Date();
  return { start, end };
}

async function salesByPeriod(query) {
  const { start, end } = parsePeriod(query);

  const orders = await prisma.order.findMany({
    where: { paidAt: { gte: start, lte: end }, status: "pago" },
    include: { payments: true },
  });

  const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const ticketAverage = orders.length ? revenue / orders.length : 0;
  const cancelled = await prisma.order.count({ where: { status: "cancelado", createdAt: { gte: start, lte: end } } });

  return {
    period: { start, end },
    totalOrders: orders.length,
    revenue: Number(revenue.toFixed(2)),
    ticketAverage: Number(ticketAverage.toFixed(2)),
    cancelled,
  };
}

async function topProducts(query) {
  const { start, end } = parsePeriod(query);

  const items = await prisma.orderItem.findMany({
    where: {
      order: { paidAt: { gte: start, lte: end }, status: "pago" },
    },
    include: { order: true },
  });

  const map = new Map();
  for (const item of items) {
    const current = map.get(item.productName) || { productName: item.productName, quantity: 0, total: 0 };
    current.quantity += item.quantity;
    current.total += Number(item.total);
    map.set(item.productName, current);
  }

  return Array.from(map.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 20)
    .map((it) => ({ ...it, total: Number(it.total.toFixed(2)) }));
}

async function paymentsReport(query) {
  const { start, end } = parsePeriod(query);

  const payments = await prisma.payment.findMany({
    where: {
      order: { paidAt: { gte: start, lte: end }, status: "pago" },
    },
  });

  const summary = {
    dinheiro: 0,
    pix: 0,
    cartao: 0,
    misto: 0,
    total: 0,
  };

  payments.forEach((payment) => {
    summary[payment.method] += Number(payment.amount);
    summary.total += Number(payment.amount);
  });

  Object.keys(summary).forEach((key) => {
    summary[key] = Number(summary[key].toFixed(2));
  });

  return { period: { start, end }, summary };
}

async function stockLow() {
  const items = await prisma.ingredient.findMany({ orderBy: { name: "asc" } });
  return items.filter((item) => Number(item.currentStock) <= Number(item.minStock));
}

async function ordersByType(query) {
  const { start, end } = parsePeriod(query);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { type: true },
  });

  return orders.reduce((acc, order) => {
    acc[order.type] = (acc[order.type] || 0) + 1;
    return acc;
  }, {});
}

module.exports = { salesByPeriod, topProducts, paymentsReport, stockLow, ordersByType };
