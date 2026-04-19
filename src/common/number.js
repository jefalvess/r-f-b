function decimal(value) {
  return Number(value || 0).toFixed(2);
}

function toNumber(value) {
  return Number(value || 0);
}

module.exports = { decimal, toNumber };
