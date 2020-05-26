const connection = require('../lib/mySqlConnection')

const getLatestVersion = () => {
  return new Promise((resolve, reject) => {
    connection
      .select('SELECT * FROM abount_moe_assisstant ORDER BY updateTime DESC')
      .then((results) => {
          const lastedVersion = Object.assign({}, results[0])

          lastedVersion.content = lastedVersion.updateContent.replace(/\\n/g, '\n')
          resolve(lastedVersion)
      })
  })
}

module.exports = { getLatestVersion }
