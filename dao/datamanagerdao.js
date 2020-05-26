const connection = require('../lib/mySqlConnection')

const zjsnrEnemyInfo = require('../modules/zjsnrEnemy')

/**
 * 向数据库中传入战舰少女R的舰娘数据
 * @param {Array} keys 列名组成的数组
 * @param {Array} values 值组成的数组
 */
const insertZJSNRShipInfo = (keys, values, positionKeyValuePair) => {
    return connection.insert('war_ship_girls_ship', keys, values, positionKeyValuePair)
}

/**
 * 向数据库中传入战舰少女R的装备数据
 * @param {Array} keys 列名组成的数组
 * @param {Array} values 值组成的数组
 */
const insertZJSNREquipmentInfo = (keys, values, positionKeyValuePair) => {
    return connection.insert('war_ship_girls_equipment', keys, values, positionKeyValuePair)
}

const insertZJSNREnemyInfo = (keys, values, positionKeyValuePair) => {
    return connection.insert('war_ship_girls_enemy', keys, values, positionKeyValuePair)
}

const insertZJSNRExpendition = (keys, values) => {
    return connection.insert('war_ship_girls_expedition', keys, values)
}

const updateZJSNREquipmentShipType = data => {
    return connection.update('war_ship_girls_equipment', ['shipType'], [data.value], `type='${data.condition}'`)
}

const enteringCannonryOrderingData = (keys, values) => {
    return connection.insert('war_ship_girls_cannonary', keys, values)
}

const insertZJSNRBuildTimeList = (keys, values) => {
    return connection.insert('war_ship_girls_build_time', keys, values)
}

const insertZJSNRMapInfo = (keys, values) => {
    return connection.insert('war_ship_girls_map_setting', keys, values)
}

const queryCidNameList = () => {
    return connection.select('SELECT cid, name, rarity, dexIndex FROM war_ship_girls_ship')
}

const queryEnemyInfo = name => {
    return new Promise((resolve, reject) => {
        connection.querySingleResult('war_ship_girls_enemy', '`name`', name).then(results => {
            resolve(new zjsnrEnemyInfo(results[0]))
        })
    })
}

const insertZJSNRAcademy = (keys, values) => {
    return connection.insert('war_ship_girls_academy', keys, values)
}

const insertZJSNRMenu = (keys, values) => {
    return connection.insert('war_ship_girls_menu', keys, values)
}

const insertCQHYPersonalScripts = (keys, values) => {
    return connection.insert('the_mirage_of_steelblue_personal_script', keys, values)
}

const insertCQHYReactionScripts = (keys, values) => {
    return connection.insert('the_mirage_of_steelblue_reaction_script', keys, values)
}

module.exports = {
    insertZJSNRShipInfo,
    insertZJSNREquipmentInfo,
    insertZJSNRExpendition,
    updateZJSNREquipmentShipType,
    enteringCannonryOrderingData,
    insertZJSNRBuildTimeList,
    insertZJSNRMapInfo,
    queryCidNameList,
    insertZJSNREnemyInfo,
    queryEnemyInfo,
    insertZJSNRAcademy,
    insertZJSNRMenu,
    insertCQHYPersonalScripts,
    insertCQHYReactionScripts
}