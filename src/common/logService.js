const { Log } = require("../models");

async function registerLog({ entity, entityId, action, payload, userId }) {
  return Log.create({
    entity,
    entityId,
    action,
    payload,
    userId,
  });
}

module.exports = { registerLog };
