const mistDAO = require("../dao/cqhydao")

async function queryShipScript(id, onSuccess) {
  const result = await mistDAO.queryShipScript(id)

  onSuccess(result)
}

module.exports = {
  queryShipScript,
}
