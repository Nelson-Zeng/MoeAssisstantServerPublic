const mysql = require('mysql')
const utils = require('./utils')
const constants = require('./constants')

const query = (sql, parameters) => {
  const connection = mysql.createConnection(constants.CONFIG.db)

  connection.connect()
  return new Promise((resolve, reject) => {
    connection.query(sql, parameters, (err, result) => {
      connection.end()

      if (err) reject(err)
      else resolve(result)
    })
  })
}

const insert = (table, keys, values, positionKeyValuePair) => {
  keys = keys.map((key) => {
    return `\`${key}\``
  })

  if (positionKeyValuePair && Object.keys(positionKeyValuePair).length > 0) {
    const querySql = `SELECT * FROM ${table} WHERE \`${positionKeyValuePair.key}\` = ${positionKeyValuePair.value}`

    return new Promise((resolve, reject) => {
      query(querySql).then((res) => {
        if (res.length) {
          // 已有数据时执行更新操作
          const dataArray = keys.map((key, index) => {
            return `${key} = '${values[index]}'`
          })
          const updateSql = `UPDATE ${table} SET ${dataArray.join(
            ', '
          )} WHERE ${positionKeyValuePair.key} = ${positionKeyValuePair.value}`

          query(updateSql).then(() => {
            resolve()
          })
        } else {
          // 无相关数据时执行插入操作
          const insertSql = `INSERT INTO ${table} (${keys.join(
            ', '
          )}) VALUES (${utils.getValuePlaceHolder(values)})`
          query(insertSql, values).then(() => {
            resolve()
          })
        }
      })
    })
  } else {
    const sql = `INSERT INTO ${table} (${keys.join(
      ', '
    )}) VALUES (${utils.getValuePlaceHolder(values)})`
    return query(sql, values)
  }
}

const update = (table, keys, values, condition) => {
  let updateContent = []
  keys.map((key, index) => {
    updateContent.push(`${key}='${values[index]}'`)
  })
  const sql = `UPDATE ${table} SET ${updateContent.join(
    ', '
  )} WHERE ${condition}`
  return query(sql)
}

const pagination = (
  tabel,
  orderType,
  page,
  capacity,
  additionalOptions,
  orderSequence = 'asc',
  keyColumn = 'name',
  keyWord = '',
  queryContent = '*',
  joinTable
) => {
  let sql = `SELECT ${queryContent} FROM ${tabel}`

  // 追加限制条件
  // 追加连表查询
  if (joinTable) sql = `${sql} ${joinTable}`

  let limitations = []
  // 过滤条件
  if (Object.keys(additionalOptions).length !== 0)
    for (let key in additionalOptions) {
      limitations.push(`${key} IN ('${additionalOptions[key].join("', '")}')`)
    }

  // 追加搜索条件
  if (keyWord)
    switch (keyColumn) {
      case 'name':
        limitations.push(`${keyColumn} LIKE '%${keyWord}%'`)
        break
      case 'dexIndex':
        limitations.push(`${keyColumn} = '${keyWord}'`)
        break
    }

  // 合并並追加限制条件
  if (limitations.length > 0) sql = `${sql} WHERE ${limitations.join(' AND ')}`

  sql = `${sql} ORDER BY ${orderType} ${orderSequence}`

  // 追加分页信息
  if (page && capacity) {
    const cursor = (page - 1) * capacity

    sql = `${sql} LIMIT ${cursor}, ${capacity}`
  }

  // 追加搜索信息
  return query(sql)
}

const selectByType = (tabel, type, orderType, orderSequence = 'asc') => {
  let sql = `SELECT * FROM ${tabel} WHERE type = '${type}' ORDER BY ${orderType} ${orderSequence}`
  return query(sql)
}

const querySingleResult = (table, column, id, joinTable) => {
  let sql = `SELECT * FROM ${table} ${
    joinTable ? joinTable : ''
  } WHERE ${column} = '${id}'`

  return query(sql)
}

const queryAntiSubmarineBasedEquipmentsInfo = (sequence) => {
  let sql = `SELECT * FROM war_ship_girls_equipment WHERE antiSubmarine IS NOT NULL AND type NOT IN ('鱼雷机', '轰炸机', '雷达-声呐', '反潜设备', '深海') ORDER BY dexIndex ${sequence}`
  return query(sql)
}

const queryLifeBasedEquipmentsInfo = (sequence) => {
  let sql = `SELECT * FROM war_ship_girls_equipment WHERE life IS NOT NULL ORDER BY dexIndex ${sequence}`
  return query(sql)
}

const queryEquipmentsBasedOnSpescialEffect = (keyWord, sequence) => {
  let sql = `SELECT * FROM war_ship_girls_equipment WHERE specialEffect LIKE '%${keyWord}%' ORDER BY dexIndex ${sequence}`
  return query(sql)
}

const queryAll = (table) => {
  const sql = `SELECT * FROM ${table}`
  return query(sql)
}

const queryResult = (table, conditions) => {
  let conditionQueries = ''
  const conditionList = []
  conditions.map((condition) => {
    conditionList.push(`${condition.column} = '${condition.value}'`)
  })

  if (conditionList.length > 0)
    conditionQueries = `WHERE ${conditionList.join(' AND ')}`

  const sql = `SELECT * FROM ${table} ${conditionQueries}`

  return query(sql)
}

const select = (sql) => {
  return query(sql)
}

module.exports = {
  insert,
  update,
  pagination,
  selectByType,
  querySingleResult,
  queryEquipmentsBasedOnSpescialEffect,
  queryAntiSubmarineBasedEquipmentsInfo,
  queryAll,
  queryResult,
  queryLifeBasedEquipmentsInfo,
  select,
}
