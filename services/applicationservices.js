const applicationDAO = require('../dao/applicationdao')

async function getLatestVersion(onSuccess) {
  const result = await applicationDAO.getLatestVersion()

  onSuccess(result)
}

module.exports = { getLatestVersion }
