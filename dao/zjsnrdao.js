const connection = require('../lib/mySqlConnection')

const zjsnrShipInfo = require('../modules/zjsnrShipInfo')
const zjsnrEquipment = require('../modules/zjsnrEquipment')
const zjsnrExpeditionInfo = require('../modules/zjsnrExpedition')
const zjsnrSeaChartInfo = require('../modules/zjsnrSeaChartInfo')
const zjsnrAcademyInfo = require('../modules/zjsnrAcademy')
const zjsnrMenuInfo = require('../modules/zjsnrMenu')

const queryShipsInfo = (query, addtionalOptions, joinTable) => {
  return new Promise((resolve, reject) => {
    connection
      .pagination(
        'war_ship_girls_ship',
        query.orderBy,
        query.page,
        query.capacity,
        addtionalOptions,
        query.sequence,
        query.keyColumn,
        query.keyWord,
        '*',
        joinTable
      )
      .then((result) => {
        const shipList = result.map((item) => {
          return new zjsnrShipInfo(item)
        })
        connection
          .pagination(
            'war_ship_girls_ship',
            query.orderBy,
            '',
            '',
            addtionalOptions,
            query.sequence,
            query.keyColumn,
            query.keyWord,
            'count(*)',
            joinTable
          )
          .then((count) => {
            resolve({
              shipList: shipList,
              total: count[0]['count(*)'],
            })
          })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const queryEquipmentsInfo = (query) => {
  return new Promise((resolve, reject) => {
    connection
      .selectByType(
        'war_ship_girls_equipment',
        query.type,
        query.orderType,
        query.sequence
      )
      .then((result) => {
        resolve(
          result.map((item) => {
            return new zjsnrEquipment(item)
          })
        )
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const getOriginalShipInfo = (id, joinTable) => {
  return new Promise((resolve, reject) => {
    connection
      .querySingleResult('war_ship_girls_ship', 'dexIndex', id, joinTable)
      .then((result) => {
        if (result.length > 0) resolve(result[0])
        else resolve({})
      })
  })
}

const queryAntiSubmarineBasedEquipmentsInfo = (sequence) => {
  return new Promise((resolve, reject) => {
    connection
      .queryAntiSubmarineBasedEquipmentsInfo(sequence)
      .then((result) => {
        resolve(
          result.map((item) => {
            return new zjsnrEquipment(item)
          })
        )
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const querySpecialEffectBasedEquipmentsInfo = (keyWord, sequence) => {
  return new Promise((resolve, reject) => {
    connection
      .queryEquipmentsBasedOnSpescialEffect(keyWord, sequence)
      .then((result) => {
        resolve(
          result.map((item) => {
            return new zjsnrEquipment(item)
          })
        )
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const queryLifeBasedEquipmentsInfo = (sequence) => {
  return new Promise((resolve, reject) => {
    connection
      .queryLifeBasedEquipmentsInfo(sequence)
      .then((result) => {
        resolve(
          result.map((item) => {
            return new zjsnrEquipment(item)
          })
        )
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const queryExpeditions = () => {
  return new Promise((resolve, reject) => {
    connection.queryAll('war_ship_girls_expedition').then((result) => {
      resolve(
        result.map((item) => {
          return new zjsnrExpeditionInfo(item)
        })
      )
    })
  })
}

const queryCannonryOrder = (conditions) => {
  return connection.queryResult('war_ship_girls_cannonary', conditions)
}

const queryBuildTime = (type) => {
  return connection.queryResult('war_ship_girls_build_time', [
    { column: 'type', value: type },
  ])
}

const querySpecialEffectEquipmentsInfo = () => {
  return connection.select(
    'SELECT * FROM war_ship_girls_equipment WHERE specialEffect NOT LIKE "%经验%" AND specialEffect NOT LIKE "%补正%" AND specialEffect NOT LIKE "%倍率%" AND specialEffect NOT LIKE "%仅限%" AND specialEffect NOT REGEXP "^铝耗" AND specialEffect NOT LIKE "%耐久%" AND specialEffect NOT LIKE "%专用%"'
  )
}

const queryShipName = (cid) => {
  return connection.select(
    `SELECT name FROM war_ship_girls_ship WHERE cid = ${cid}`
  )
}

const querySeaChartInfo = () => {
  return new Promise((resolve, reject) => {
    connection.queryAll('war_ship_girls_map_setting').then((results) => {
      resolve(
        results.map((result) => {
          return new zjsnrSeaChartInfo(result)
        })
      )
    })
  })
}

const queryShipInfo = (id, joinTable) => {
  return connection.querySingleResult(
    'war_ship_girls_ship',
    'dexIndex',
    id,
    joinTable
  )
}

const queryAcademyInfo = () => {
  return new Promise((resolve, reject) => {
    connection.queryAll('war_ship_girls_academy').then((results) => {
      resolve(
        results.map((result) => {
          return new zjsnrAcademyInfo(result)
        })
      )
    })
  })
}

const queryMenuInfo = () => {
  return new Promise((resolve, reject) => {
    connection.queryAll('war_ship_girls_menu').then((results) => {
      resolve(
        results.map((result) => {
          return new zjsnrMenuInfo(result)
        })
      )
    })
  })
}

const setEvaluation = content => {
  return new Promise((resolve, reject) => {
    connection.insert('war_ship_girls_custom_evaluation', Object.keys(content), Object.values(content), {key: 'index', value: content.index}).then(result => {
      resolve()
    })
  })
}

module.exports = {
  queryShipsInfo,
  queryEquipmentsInfo,
  getOriginalShipInfo,
  querySpecialEffectBasedEquipmentsInfo,
  queryAntiSubmarineBasedEquipmentsInfo,
  queryExpeditions,
  queryCannonryOrder,
  queryLifeBasedEquipmentsInfo,
  queryBuildTime,
  querySpecialEffectEquipmentsInfo,
  queryShipName,
  querySeaChartInfo,
  queryShipInfo,
  queryAcademyInfo,
  queryMenuInfo,
  setEvaluation
}
