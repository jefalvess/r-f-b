const { prisma } = require("../../config/prisma");

function createOrder(data) {
  return prisma.order.create({ data });
}

function getOpenOrders() {
  return prisma.order.findMany({
    where: { status: { notIn: ["pago", "cancelado"] } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

function findOrderById(id) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, payments: true },
  });
}

function findProductById(id) {
  return prisma.product.findUnique({ where: { id } });
}

function createItem(data) {
  return prisma.orderItem.create({ data });
}

function findItemById(itemId) {
  return prisma.orderItem.findUnique({ where: { id: itemId } });
}

function updateItem(itemId, data) {
  return prisma.orderItem.update({ where: { id: itemId }, data });
}

function removeItem(itemId) {
  return prisma.orderItem.delete({ where: { id: itemId } });
}

function updateOrder(id, data) {
  return prisma.order.update({
    where: { id },
    data,
    include: { items: true, payments: true },
  });
}

function createPayment(data) {
  return prisma.payment.create({ data });
}

module.exports = {
  prisma,
  createOrder,
  getOpenOrders,
  findOrderById,
  findProductById,
  createItem,
  findItemById,
  updateItem,
  removeItem,
  updateOrder,
  createPayment,
};
