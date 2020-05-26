const path = require('path')
const XLSX = require('xlsx')
const fs = require('fs')

const utils = require('../lib/utils')
const constants = require('../lib/constants')
const dmDAO = require('../dao/datamanagerdao')
const mist = require('../lib/mistCharacters')

const BIGGER_SHIP_TYPE = [
  '航母',
  '轻母',
  '装母',
  '战列',
  '航战',
  '导驱',
  '导战',
  '防驱',
]

const SMALLER_SHIP_TYPE = [
  '重巡',
  '航巡',
  '雷巡',
  '轻巡',
  '重炮',
  '驱逐',
  '补给',
]

const UNDER_SEA_SHIP_TYPE = ['潜艇', '炮潜']

/**
 * 向数据库中插入战舰少女R的舰娘数据
 * @param {Function} onSuccess 传入成功的回调方法
 */
async function insertZJSNRShipInformationService(onSuccess) {
  const dictionaryPath = path.join(
    __dirname,
    constants.ZJSNR_ROOT_PATH,
    '/ship'
  )
  const mappingInfo = constants.ZJNSR_SHIP_PARAMETER_MAPPING

  const items = await utils.readFiles(dictionaryPath, (data) => {
    let shipKeys = []
    let shipValues = []
    const content = JSON.parse(data.toString())
    const parameters = content.data.split(',')

    shipKeys.push('picId')
    shipValues.push(content.picId)
    shipKeys.push('cid')
    shipValues.push(content.cid)
    shipKeys.push('dexIndex')
    shipValues.push(parameters[0])
    shipKeys.push('name')
    shipValues.push(parameters[1])
    shipKeys.push('nationality')
    shipValues.push(parameters[2])
    // 前三个属性不是A:B格式，原因：“问摸鱼”
    const pairingParameters = parameters.slice(3)
    pairingParameters.map((parameter) => {
      const keyValuePair = parameter.split(':')
      mappingInfo.forEach((item) => {
        if (
          (item.column === 'firstSkill' || item.column === 'secondSkill') &&
          keyValuePair[0].indexOf(item.value) >= 0
        ) {
          let value = keyValuePair[1]
          shipKeys.push(`${item.column}Title`)
          shipValues.push(keyValuePair[0].split(`${item.value}(3级)`)[1])
          shipKeys.push(item.column)
          shipValues.push(value)
        } else if (
          (item.column === 'power' || item.column === 'torpedo') &&
          item.value === keyValuePair[0]
        ) {
          let value = keyValuePair[1]
          shipKeys.push(item.column)
          shipValues.push(value)
          shipKeys.push(`${item.column}Max`)
          shipValues.push(Number(value.split('/')[1]))
        } else if (item.value === keyValuePair[0]) {
          let value = keyValuePair[1]
          item.column === 'speed' &&
            (value = value.match(new RegExp(/^\d*/))[0])
          shipKeys.push(item.column)
          shipValues.push(value)
        }
      })
    })

    return [shipKeys, shipValues, { key: 'dexIndex', value: parameters[0] }]
  })

  utils.progressiveDataBaseWork(dmDAO, 'insertZJSNRShipInfo', items, onSuccess)
}

/**
 * 向数据库中插入战舰少女R的装备数据
 * @param {Function} onSuccess 处理成功的回调方法
 */
async function insertZJSNREquipmentInformationService(onSuccess) {
  const dictionaryPath = path.join(
    __dirname,
    constants.ZJSNR_ROOT_PATH,
    '/equipment'
  )
  const mappingInfo = constants.ZJSNR_EQUIPMENT_PARAMETER_MAPPING

  const items = await utils.readFiles(dictionaryPath, (data) => {
    let equipmentKeys = []
    let equipmentValues = []

    const content = JSON.parse(data.toString())
    const parameters = content.data.toString().split(',')

    equipmentKeys.push('picId')
    equipmentValues.push(content.picId)
    equipmentKeys.push('cid')
    equipmentValues.push(content.cid)
    equipmentKeys.push('dexIndex')
    equipmentValues.push(parameters[0])
    equipmentKeys.push('name')
    equipmentValues.push(parameters[1])
    // 前两个属性不是A:B格式，原因：“问摸鱼”
    const pairingParameters = parameters.slice(2)

    pairingParameters.map((parameter) => {
      const keyValuePair = parameter.split(':')
      mappingInfo.forEach((item) => {
        if (item.value === keyValuePair[0]) {
          let value = keyValuePair[1]
          equipmentKeys.push(item.column)
          equipmentValues.push(value)
        }
      })
    })

    return [
      equipmentKeys,
      equipmentValues,
      { key: 'dexIndex', value: parameters[0] },
    ]
  })

  utils.progressiveDataBaseWork(
    dmDAO,
    'insertZJSNREquipmentInfo',
    items,
    onSuccess
  )
}

async function insertZJSNREnemyInformationService(onSuccess) {
  const dictionaryPath = path.join(
    __dirname,
    constants.ZJSNR_ROOT_PATH,
    '/enemy'
  )

  const valuesNeedCaculate = [
    '耐久',
    '火力',
    '装甲',
    '鱼雷',
    '对空',
    '对潜',
    '索敌',
    '闪避',
  ]

  let contents = []

  await utils.readFiles(dictionaryPath, (data) => {
    const specialEnemy = [
      29016109,
      29016110,
      29016111,
      29016112,
      29016113,
      29016114,
      20100001,
      20100002,
      20100003,
      20100004,
      20100005,
    ]
    const content = JSON.parse(data.toString())

    let enemyKeys = []
    let enemyValues = []

    const enemyName = content.data.split(',')[1]

    if (
      new RegExp(/\S*级\S*型/).test(enemyName) ||
      specialEnemy.includes(Number(content.cid))
    ) {
      enemyKeys.push('picId')
      enemyKeys.push('cid')
      enemyKeys.push('name')
      enemyValues.push(content.picId)
      enemyValues.push(content.cid)
      enemyValues.push(enemyName)

      const params = content.data.split(',').slice(2)

      params.map((item) => {
        const temp = item.split(':')

        const key = temp[0].trim()
        const value = temp[1].trim()

        if (valuesNeedCaculate.includes(key)) {
          const baseColumn = constants.ZJSNR_ENEMY_PARAMETER_MAPPING.find(
            (item) => {
              return item.value === key
            }
          ).column
          enemyKeys.push(baseColumn)
          enemyValues.push(value)

          const dividedValue = value
            .match(new RegExp(/^(\d*)[+-]?(\d*)/))
            .slice(1)
          enemyKeys.push(
            `caculated${utils.turnFirstLetter2UperCase(baseColumn)}`
          )
          enemyValues.push(
            dividedValue.reduce((a, b) => {
              return Number(a) + Number(b)
            })
          )
        } else if (key === '航速') {
          enemyKeys.push(
            constants.ZJSNR_ENEMY_PARAMETER_MAPPING.find((item) => {
              return item.value === key
            }).column
          )
          enemyValues.push(Number(value.split('节')[0]))
        } else {
          enemyKeys.push(
            constants.ZJSNR_ENEMY_PARAMETER_MAPPING.find((item) => {
              return item.value === key
            }).column
          )
          enemyValues.push(value)
        }
      })

      contents.push([
        enemyKeys,
        enemyValues,
        { key: 'cid', value: content.cid },
      ])
    }
  })

  utils.progressiveDataBaseWork(
    dmDAO,
    'insertZJSNREnemyInfo',
    contents,
    onSuccess
  )
}

function parseZJSNREquipmentShipType(onSuccess) {
  const file = utils.readXLSX(
    path.join(__dirname, constants.STRATEGY_ROOT_PATH, '装备类型表.xlsx')
  )

  const sheetData = XLSX.utils.sheet_to_json(file.Sheets['装备类型'])
  const data = []
  sheetData.map((item) => {
    let currentData = {}
    let currentShipTypes = []
    for (let key in item) {
      switch (key) {
        case '小类':
          currentData.condition = item[key]
          break
        default:
          currentShipTypes.push(item[key])
          break
      }
    }
    currentData.value = currentShipTypes.join(',')

    data.push(currentData)
  })

  utils.progressiveDataBaseWork(
    dmDAO,
    'updateZJSNREquipmentShipType',
    data,
    () => {
      onSuccess(data)
    }
  )
}

const updateExpeditionData = (file) => {
  return new Promise((resolve, reject) => {
    const fileData = file.Sheets['远征表']

    const fileJSONData = XLSX.utils.sheet_to_json(fileData)
    let expeditionData = []
    let currentEpisodePointer = '第一章'

    for (let i = 0; i < fileJSONData.length; i++) {
      let expeditionKeys = []
      let expeditionValues = []
      const item = fileJSONData[i]
      if (item['旧名'] === '《远征效率表》') break

      if (Object.keys(item).length === 1) {
        // 只有一个属性的时候说明该行对应章节名
        currentEpisodePointer = item['旧名']
      } else {
        // 有多个属性的时候说明包含不同内容
        expeditionKeys.push('episode')
        expeditionValues.push(currentEpisodePointer)
        expeditionKeys.push('name')
        expeditionValues.push(item['名称'])

        expeditionKeys.push('timespend')
        expeditionValues.push(item['远征时长'])
        const hour = item['远征时长'].match(
          new RegExp(/((\d*)小时)?((\d*)分钟)?/)
        )[2]
          ? Number(
              item['远征时长'].match(new RegExp(/((\d*)小时)?((\d*)分钟)?/))[2]
            )
          : 0
        const minite = item['远征时长'].match(
          new RegExp(/((\d*)小时)?((\d*)分钟)?/)
        )[4]
          ? Number(
              item['远征时长'].match(new RegExp(/((\d*)小时)?((\d*)分钟)?/))[4]
            )
          : 0
        const time = hour * 60 + minite
        expeditionKeys.push('time')
        expeditionValues.push(time)

        expeditionKeys.push('requirement')
        expeditionValues.push(item['远征条件'])

        const rewards = item['报酬']
        rewardsItems = rewards.split(' ')
        rewardsItems.map((reward) => {
          if (new RegExp(/（[^（）]*）/).test(reward)) {
            expeditionKeys.push('special')
            expeditionValues.push(reward.match(new RegExp(/（([^（）]*)/))[1])
          } else {
            const rewardPair = reward.match(/([\u4e00-\u9fa5]*)[+*](\d*)/)
            switch (rewardPair[1]) {
              case '燃料':
                expeditionKeys.push('oil')
                expeditionValues.push(Number(rewardPair[2]))
                expeditionKeys.push('oilefficiency')
                expeditionValues.push((Number(rewardPair[2]) / time).toFixed(2))
                break
              case '弹药':
                expeditionKeys.push('ammo')
                expeditionValues.push(Number(rewardPair[2]))
                expeditionKeys.push('ammoefficiency')
                expeditionValues.push((Number(rewardPair[2]) / time).toFixed(2))
                break
              case '钢铁':
                expeditionKeys.push('steel')
                expeditionValues.push(Number(rewardPair[2]))
                expeditionKeys.push('steelefficiency')
                expeditionValues.push((Number(rewardPair[2]) / time).toFixed(2))
                break
              case '铝材':
                expeditionKeys.push('aluminium')
                expeditionValues.push(Number(rewardPair[2]))
                expeditionKeys.push('aluminiumefficiency')
                expeditionValues.push((Number(rewardPair[2]) / time).toFixed(2))
                break
            }
          }
        })

        expeditionData.push([expeditionKeys, expeditionValues])
      }
    }

    utils.progressiveDataBaseWork(
      dmDAO,
      'insertZJSNRExpendition',
      expeditionData,
      () => {
        console.log('远征信息录入完成')
        resolve()
      }
    )
  })
}

const updateZJSNRBuildTimeList = (file) => {
  return new Promise((resolve, reject) => {
    const fileData = file.Sheets['建造表']

    // 时间格式经过xlsx解析之后会得到奇怪的值，所以这里指定采用其初始值（raw: false）
    const content = XLSX.utils.sheet_to_json(fileData, { raw: false })

    let buildTimeList = []
    const timeKeys = [
      'dexIndex',
      'name',
      'shipClass',
      'stringifiedTime',
      'numbericTime',
      'type',
    ]
    content.map((line) => {
      // 满足此匹配时说明该列为数据列
      let timePairs
      line.__EMPTY_2 &&
        (timePairs = line.__EMPTY_2.match(new RegExp(/^(\d*):(\d*)$/)))

      if (timePairs && timePairs.length !== 0) {
        const hour = Number(timePairs[1])
        const minute = Number(timePairs[2])

        const numbericTime = 60 * hour + minute

        const timeValues = [
          line['【建造时间表】'],
          line.__EMPTY,
          line.__EMPTY_1,
          line.__EMPTY_2,
          numbericTime,
          0,
        ]

        buildTimeList.push([timeKeys, timeValues])
      }
    })

    utils.progressiveDataBaseWork(
      dmDAO,
      'insertZJSNRBuildTimeList',
      buildTimeList,
      () => {
        console.log('建造信息录入完成')
        resolve()
      }
    )
  })
}

const updateZJSNRDevelopmentTimeList = (file) => {
  return new Promise((resolve, reject) => {
    const fileData = file.Sheets['开发表']

    // 时间格式经过xlsx解析之后会得到奇怪的值，所以这里指定采用其初始值（raw: false）
    const content = XLSX.utils.sheet_to_json(fileData, { raw: false })

    let buildTimeList = []
    const timeKeys = [
      'dexIndex',
      'name',
      'shipClass',
      'stringifiedTime',
      'numbericTime',
      'type',
    ]
    let tempStringifiedTime

    content.map((line) => {
      if (line['【开发时间表】']) {
        // 满足一行只有一个数据时说明该列为时间列
        if (Object.keys(line).length === 1)
          tempStringifiedTime = line['【开发时间表】']
        else {
          const timePairs = tempStringifiedTime.match(
            new RegExp(/^(\d*):(\d*):(\d*)$/)
          )

          const hour = Number(timePairs[1])
          const minute = Number(timePairs[2])
          const second = Number(timePairs[3])

          const numbericTime = 60 * hour + minute * 60 + second

          const timeValues = [
            null,
            line['【开发时间表】'],
            null,
            tempStringifiedTime,
            numbericTime,
            1,
          ]

          buildTimeList.push([timeKeys, timeValues])
        }
      }
    })

    utils.progressiveDataBaseWork(
      dmDAO,
      'insertZJSNRBuildTimeList',
      buildTimeList,
      () => {
        console.log('开发信息录入完成')
        resolve()
      }
    )
  })
}

const generateEnemyInfo = (enemySetting, onSuccess) => {
  console.log('初始数据', enemySetting)
  if (enemySetting === '-') onSuccess({})
  else {
    // example: （单纵）战巡Κ级Ⅳ型、战巡Κ级Ⅳ型、重巡Ω级Ⅲ型、重巡Ω级Ⅱ型、驱逐Τ级Ⅱ型、驱逐Τ级Ⅱ型
    const formation = enemySetting.match(
      new RegExp(/（([\u4e00-\u9fa5]*)）/)
    )[1]

    const names = enemySetting
      .split('）')[1]
      .split('、')
      .map((name) => {
        return name.trim()
      })

    utils.progressiveDataBaseWork(dmDAO, 'queryEnemyInfo', names, (result) => {
      let teamAntiAircraft = 0
      let teamTracking = 0
      let teamSpeed = 0
      const flagShipSpeed = result[0].speed

      let biggerShipSpeedList = []
      let smallerShipSpeedList = []
      let underSeaShipSpeedList = []
      let displayList = []

      result.map((item) => {
        teamAntiAircraft += item.caculatedAntiAircraft
        teamTracking += item.caculatedTracking

        if (BIGGER_SHIP_TYPE.includes(item.type))
          biggerShipSpeedList.push(item.speed)
        else if (SMALLER_SHIP_TYPE.includes(item.type))
          smallerShipSpeedList.push(item.speed)
        else if (UNDER_SEA_SHIP_TYPE.includes(item.type))
          underSeaShipSpeedList.push(item.speed)

        let textColor = ''
        switch (item.rarity) {
          case 1:
            textColor = '#666666'
            break
          case 2:
            textColor = '#339933'
            break
          case 3:
            textColor = '#3399FF'
            break
          case 4:
            textColor = '#CC00FF'
            break
          case 5:
            textColor = '#FF9900'
            break
          case 6:
            textColor = '#FF0000'
            break
        }
        displayList.push(
          JSON.stringify({ color: textColor, content: item.name })
        )
      })

      //如果全是水下舰队才计算潜艇均速，否则无视
      if (
        underSeaShipSpeedList.length === result.length &&
        underSeaShipSpeedList.length > 0
      )
        teamSpeed = utils.getAverage.call(underSeaShipSpeedList)
      else if (
        biggerShipSpeedList.length === result.length &&
        biggerShipSpeedList.length > 0
      )
        teamSpeed = utils.getAverage.call(biggerShipSpeedList, false)
      else if (
        smallerShipSpeedList.length === result.length &&
        smallerShipSpeedList.length > 0
      )
        teamSpeed = utils.getAverage.call(smallerShipSpeedList, false)
      else {
        const biggerShipSpeed = utils.getAverage.call(biggerShipSpeedList)
        const smallerShipSpeed = utils.getAverage.call(smallerShipSpeedList)

        if (biggerShipSpeed === 0) teamSpeed = smallerShipSpeed
        else if (smallerShipSpeed === 0) teamSpeed = biggerShipSpeed
        else teamSpeed = Math.min(biggerShipSpeed, smallerShipSpeed)
      }

      const teamDisplay = displayList.join(constants.SECONDARY_SEPARATE_MARK)

      const enemyInfo = {
        display: teamDisplay,
        speed: teamSpeed,
        tracking: teamTracking,
        antiAircraft: teamAntiAircraft,
        formation: formation,
        flagShipSpeed: flagShipSpeed
      }

      onSuccess(JSON.stringify(enemyInfo))
    })
  }
}

const updateSeaChartContent = (file) => {
  return new Promise((resolve, reject) => {
    const fileData = file.Sheets['出征表']

    // 为了解析方便请在CNM原表的基础上添加头列ID，以X-Y形式代表海图
    const content = XLSX.utils.sheet_to_json(fileData)

    let map = []
    const mapKeys = ['map', 'mission', 'description', 'enemyInfo']
    let mapValues = []

    let currentMapPoints = []
    let enemySettingAInCurrentPosition = []
    let enemySettingBInCurrentPosition = []
    let enemySettingCInCurrentPosition = []

    const dataAnalysisingPromise = new Promise((resolve, reject) => {
      function disposeData(index) {
        if (index < content.length) {
          const line = content[index]
          let promiseList = []

          if (line['ID']) {
            if (mapValues.length !== 0) {
              let enemySetting = []

              currentMapPoints.map((point, index) => {
                enemySetting.push(
                  JSON.stringify({
                    point: point,
                    setting: enemySettingAInCurrentPosition[index]
                      ? enemySettingAInCurrentPosition[index]
                      : '无',
                    setting2: enemySettingBInCurrentPosition[index]
                      ? enemySettingBInCurrentPosition[index]
                      : '无',
                    setting3: enemySettingCInCurrentPosition[index]
                      ? enemySettingCInCurrentPosition[index]
                      : '无',
                  })
                )
              })

              if (enemySetting.length === 0)
                enemySetting = [
                  JSON.stringify({
                    point: 'A',
                    setting: JSON.stringify({
                      display: [
                        JSON.stringify({
                          content: 'Sükhbaatar',
                          color: '#666666',
                        }),
                        JSON.stringify({ content: 'Odin', color: '#666666' }),
                      ].join(constants.SECONDARY_SEPARATE_MARK),
                    }),
                    setting2: JSON.stringify({
                      display: [
                        JSON.stringify({
                          content: '(´・ω・｀)',
                          color: '#FF0000',
                        }),
                        JSON.stringify({
                          content: '(´・∀・｀)',
                          color: '#FF0000',
                        }),
                      ].join(constants.SECONDARY_SEPARATE_MARK),
                    }),
                  }),
                ]

              mapValues.push(enemySetting.join(constants.SEPARATE_MARK))

              map.push([mapKeys, mapValues])
            }

            currentMapPoints = []
            enemySettingAInCurrentPosition = []
            enemySettingBInCurrentPosition = []
            enemySettingCInCurrentPosition = []
            mapValues = []
            enemySetting = {}
            mapValues.push(line['ID'])
            mapValues.push(line['__EMPTY_1'])
            mapValues.push(line['__EMPTY_2'])
          }

          if (line.__EMPTY === '地 点' || line.__EMPTY === '地点')
            for (let key in line) {
              if (new RegExp(/^__EMPTY_\d*$/).test(key))
                currentMapPoints.push(line[key].trim())
            }

          if (line.__EMPTY && line.__EMPTY.trim() === '配置A') {
            const promiseA = new Promise((resolve, reject) => {
              const keys = Object.keys(line)

              let getEnemyInfo = (index) => {
                const key = keys[index]

                if (index < keys.length) {
                  if (new RegExp(/^__EMPTY_\d*$/).test(key))
                    generateEnemyInfo(line[key].trim(), (result) => {
                      enemySettingAInCurrentPosition.push(result)
                      getEnemyInfo(++index)
                    })
                  else getEnemyInfo(++index)
                } else resolve()
              }

              getEnemyInfo(0)
            })

            promiseList.push(promiseA)
          }

          if (line.__EMPTY && line.__EMPTY.trim() === '配置B') {
            const promiseB = new Promise((resolve, reject) => {
              const keys = Object.keys(line)

              let getEnemyInfo = (index) => {
                const key = keys[index]

                if (index < keys.length) {
                  if (new RegExp(/^__EMPTY_\d*$/).test(key))
                    generateEnemyInfo(line[key].trim(), (result) => {
                      enemySettingBInCurrentPosition.push(result)
                      getEnemyInfo(++index)
                    })
                  else getEnemyInfo(++index)
                } else resolve()
              }

              getEnemyInfo(0)
            })

            promiseList.push(promiseB)
          }

          if (line.__EMPTY && line.__EMPTY.trim() === '配置C') {
            const promiseC = new Promise((resolve, reject) => {
              const keys = Object.keys(line)

              let getEnemyInfo = (index) => {
                const key = keys[index]

                if (index < keys.length) {
                  if (new RegExp(/^__EMPTY_\d*$/).test(key))
                    generateEnemyInfo(line[key].trim(), (result) => {
                      enemySettingCInCurrentPosition.push(result)
                      getEnemyInfo(++index)
                    })
                  else getEnemyInfo(++index)
                } else resolve()
              }

              getEnemyInfo(0)
            })

            promiseList.push(promiseC)
          }

          const fullPromise = Promise.all(promiseList)
          fullPromise.then((results) => {
            disposeData(++index)

            if (index === content.length - 1) resolve()
          })
        }
      }

      disposeData(0)
    })

    dataAnalysisingPromise.then(() => {
      let finalSetting = []

      currentMapPoints.map((point, index) => {
        finalSetting.push(
          JSON.stringify({
            point: point,
            setting: enemySettingAInCurrentPosition[index]
              ? enemySettingAInCurrentPosition[index]
              : '无',
            setting2: enemySettingBInCurrentPosition[index]
              ? enemySettingBInCurrentPosition[index]
              : '无',
            setting3: enemySettingCInCurrentPosition[index]
              ? enemySettingCInCurrentPosition[index]
              : '无',
          })
        )
      })

      mapValues.push(finalSetting.join('^v^'))

      map.push([mapKeys, mapValues])

      utils.progressiveDataBaseWork(dmDAO, 'insertZJSNRMapInfo', map, () => {
        console.log('海图信息录入完成')
        resolve()
      })
    })
  })
}

function parseZJSNROfflineData(onSuccess) {
  const file = utils.readXLSX(
    path.join(
      __dirname,
      constants.STRATEGY_ROOT_PATH,
      '戰艦少女离线资料Ver2.6.1校对版 平胸ver.xlsx'
    )
  )

  // const taskPromiseList = [updateExpeditionData(file), updateZJSNRBuildTimeList(file), updateZJSNRDevelopmentTimeList(file), updateSeaChartContent(file), updateAcademy(file), updateMenu(file)]
  const taskPromiseList = [updateSeaChartContent(file)]

  const allPromise = Promise.all(taskPromiseList)

  allPromise.then((results) => {
    onSuccess(results)
  })
}

function enteringCannonryOrderingData(onSuccess) {
  const file = utils.readXLSX(
    path.join(__dirname, constants.STRATEGY_ROOT_PATH, '炮序.xls')
  )

  let cannonryOrderList = []
  const cannonryKeys = [
    'firstPlace',
    'secondPlace',
    'thirdPlace',
    'fourthPlace',
    'fifthPlace',
    'sixthPlace',
    'cannonryOrder',
  ]

  for (let key in file.Sheets) {
    const currentTable = XLSX.utils.sheet_to_json(file.Sheets[key])

    currentTable.map((data) => {
      let cannonryOrders = ['无', '无', '无', '无', '无', '无', '']
      let cannonryResult = []
      for (key in data) {
        switch (key) {
          case '一号位':
            cannonryOrders[0] = data[key]
              ? (cannonryOrders[0] = data[key])
              : '无'
            break
          case '二号位':
            cannonryOrders[1] = data[key]
              ? (cannonryOrders[1] = data[key])
              : '无'
            break
          case '三号位':
            cannonryOrders[2] = data[key]
              ? (cannonryOrders[2] = data[key])
              : '无'
            break
          case '四号位':
            cannonryOrders[3] = data[key]
              ? (cannonryOrders[3] = data[key])
              : '无'
            break
          case '五号位':
            cannonryOrders[4] = data[key]
              ? (cannonryOrders[4] = data[key])
              : '无'
            break
          case '六号位':
            cannonryOrders[5] = data[key]
              ? (cannonryOrders[5] = data[key])
              : '无'
            break
          default:
            cannonryResult.push(data[key])
            break
        }

        cannonryOrders[6] = cannonryResult.join(',')
      }

      cannonryOrderList.push([cannonryKeys, cannonryOrders])
    })
  }

  cannonryOrderList.push([
    cannonryKeys,
    ['超长', '超长', '超长', '超长', '超长', '超长', '5,6,4,3,2,1'],
  ])
  cannonryOrderList.push([
    cannonryKeys,
    ['长', '长', '长', '长', '长', '长', '5,6,4,3,2,1'],
  ])
  cannonryOrderList.push([
    cannonryKeys,
    ['短', '短', '短', '短', '短', '短', '5,6,4,3,2,1'],
  ])

  utils.progressiveDataBaseWork(
    dmDAO,
    'enteringCannonryOrderingData',
    cannonryOrderList,
    () => {
      onSuccess()
    }
  )
}

async function createShipNameMapping(onSuccess) {
  const results = await dmDAO.queryCidNameList()

  const filePath = path.join(__dirname, '../lib/cid.js')

  const fileContent = `module.exports = ${JSON.stringify(results)}`

  fs.writeFile(filePath, fileContent, {}, (err) => {
    onSuccess()
  })
}

const generateAcademyValues = (item, phase, teacher) => {
  let values = []
  const battlePhases = ['鱼雷战', '炮击战', '鱼雷战', '航空战', '夜战']
  const shipTypes = [
    '航空母舰',
    '战列巡洋舰',
    '驱逐舰',
    '重型巡洋舰',
    '战列舰',
    '航空母舰',
    '轻型航空母舰',
  ]
  values.push(teacher)
  values.push(phase)
  values.push(item['战术名称'])

  const baseEffect = item['战术效果']
  let renderedEffect = baseEffect
  const renderedEffectPeaces = renderedEffect.split('/')
  const preRenderedEffectPeaces = renderedEffectPeaces.slice(0, 2)
  const afterRenderedEffectPeaces = renderedEffectPeaces.slice(2)
  renderedEffect = `<div>${preRenderedEffectPeaces.join(
    '/'
  )}/<br/>${afterRenderedEffectPeaces.join('/')}</div>`
  const buffValues = renderedEffect.match(/\d+\%?/g)
  for (let i = buffValues.length - 1; i >= 0; i--) {
    renderedEffect = renderedEffect.replace(
      buffValues[i],
      `<span style="color: #67C23A">${buffValues[i]}</span>`
    )
  }
  battlePhases.map((phase) => {
    renderedEffect.includes(phase) &&
      (renderedEffect = renderedEffect.replace(
        phase,
        `<span style="color: #409EFF">${phase}</span>`
      ))
  })
  shipTypes.map((shipType) => {
    renderedEffect.includes(shipType) &&
      (renderedEffect = renderedEffect.replace(
        shipType,
        `<span style="color: #F56C6C">${shipType}</span>`
      ))
  })
  values.push(renderedEffect)

  const baseAccess = item['经验获得方式']
  let renderedAccess = baseAccess
  const value = renderedAccess.match(/\+\d+/)[0]
  renderedAccess = renderedAccess.replace(
    value,
    `<span style="color: #67C23A">${value}</span>`
  )
  battlePhases.map((phase) => {
    renderedAccess.includes(phase) &&
      (renderedAccess = renderedAccess.replace(
        phase,
        `<span style="color: #409EFF">${phase}</span>`
      ))
  })
  shipTypes.map((shipType) => {
    renderedAccess.includes(shipType) &&
      (renderedAccess = renderedAccess.replace(
        shipType,
        `<span style="color: #F56C6C">${shipType}</span>`
      ))
  })
  values.push(renderedAccess)

  values.push(item['学习消耗'])
  values.push(item['舰种限制'])

  return values
}

function updateAcademy(file) {
  return new Promise((resolve, reject) => {
    const teachers = ['艾拉', '胜利号', '阿芙乐尔']
    const attackLessons = [
      '雷击熟练',
      '炮击训练',
      '拦阻射击',
      '效力射',
      '数据交互',
      '弹跳攻击',
      '穿甲航弹',
      '全甲板突击',
      '穿甲榴弹',
    ]
    const defenceLessons = [
      '对海警戒哨',
      '前哨援护',
      '过穿',
      '硬化装甲',
      '编队援护',
      '防空弹幕',
      '探照灯警戒',
      '护航援护',
      '装甲甲板',
    ]
    const specialLessons = [
      '大角度规避',
      '雁行雷击',
      '交互射击',
      '硬被帽',
      '炮塔后备弹',
      '改良被帽弹',
      '照明弹校正',
      '对空预警',
    ]
    const fileData = file.Sheets['学院技能表']

    let currentTeacher
    let academyInfo = []

    const keys = [
      'teacher',
      'phase',
      'name',
      'effect',
      'access',
      'cost',
      'limitation',
    ]

    const fileJSONData = XLSX.utils.sheet_to_json(fileData)

    fileJSONData.map((item) => {
      const key = item['战术名称']
      if (teachers.includes(key)) currentTeacher = key
      else if (attackLessons.includes(key))
        academyInfo.push([
          keys,
          generateAcademyValues.call(this, item, 'attack', currentTeacher),
        ])
      else if (defenceLessons.includes(key))
        academyInfo.push([
          keys,
          generateAcademyValues.call(this, item, 'defence', currentTeacher),
        ])
      else if (specialLessons.includes(key))
        academyInfo.push([
          keys,
          generateAcademyValues.call(this, item, 'special', currentTeacher),
        ])
    })

    utils.progressiveDataBaseWork(
      dmDAO,
      'insertZJSNRAcademy',
      academyInfo,
      () => {
        console.log('学院信息录入完成')
        resolve()
      }
    )
  })
}

function updateMenu(file) {
  return new Promise((resolve, reject) => {
    const fileData = file.Sheets['菜单']

    const fileJSONData = XLSX.utils.sheet_to_json(fileData)

    const keys = ['name', 'nationality', 'cost', 'effect', 'duration', 'access']
    let menuInfo = []

    fileJSONData.map((item) => {
      if (Object.keys(item).length > 1) {
        let cost = ''
        const baseCost = item['消耗(油/弹/钢/铝)']
        const costList = baseCost.split('/')
        cost = `<div>油：${costList[0]}</div><div>弹：${costList[1]}</div><div>钢：${costList[2]}</div><div>铝：${costList[3]}</div>`

        menuInfo.push([
          keys,
          [
            item['名称'],
            item['国籍限制'],
            cost,
            item['效果'],
            item['持续时间(烹饪成功)'].match(/\d+/)[0],
            item['备注'].match(/\[([\u4e00-\u9fa5\d\/\“\”\w\.]*)\]/)[1],
          ],
        ])
      }
    })

    utils.progressiveDataBaseWork(dmDAO, 'insertZJSNRMenu', menuInfo, () => {
      console.log('菜单信息录入完成')
      resolve()
    })
  })
}

async function insertCQHYScripts(onSuccess) {
  const dictionaryPath = path.join(__dirname, constants.CQHY_ROOT_PATH, '/台词')

  const items = await utils.scanFiles(dictionaryPath)

  let personalScripts = []
  let reactionScripts = []
  const reactionKeys = ['dexIndex', 'speaker', 'listener', 'chinese', 'japanese']
  const personalKeys = [
    'dexIndex',
    'defaultChinese',
    'defaultJapanese',
    'skinChinese',
    'skinJapanese',
  ]

  items.map((item) => {
    if (/CN/.test(item)) {
      const file = utils.readXLSX(`${dictionaryPath}/${item}`)

      const fileId = item.match(/\d*/)[0]

      const japaneseFile = utils.readXLSX(`${dictionaryPath}/${fileId}.xlsx`)

      const isSkin = fileId.length > 3
      const id = isSkin ? Number(fileId.substring(3)) : Number(fileId)
      // 处理各种数据
      const personalScriptSheet =
        XLSX.utils.sheet_to_json(file.Sheets['単体セリフ'], { raw: false })
          .length != 0
          ? XLSX.utils.sheet_to_json(file.Sheets['単体セリフ'], { raw: false })
          : XLSX.utils.sheet_to_json(file.Sheets['衣装追加セリフ'], {
              raw: false,
            })
      const japanesePersonalScriptSheet =
        XLSX.utils.sheet_to_json(japaneseFile.Sheets['単体セリフ'], {
          raw: false,
        }).length != 0
          ? XLSX.utils.sheet_to_json(japaneseFile.Sheets['単体セリフ'], {
              raw: false,
            })
          : XLSX.utils.sheet_to_json(japaneseFile.Sheets['衣装追加セリフ'], {
              raw: false,
            })

      const reactionScriptSheet = XLSX.utils.sheet_to_json(
        file.Sheets['二人セリフ'],
        { raw: false }
      )
      const japaneseReactionScriptSheet = XLSX.utils.sheet_to_json(
        japaneseFile.Sheets['二人セリフ'],
        { raw: false }
      )

      if (personalScriptSheet.length != 0) {
        let singleFileChineseValues = []
        let singleFileJapaneseValues = []

        // 处理单独数据
        personalScriptSheet.map((script, index) => {
          const typeJapanese = script['種類'] ? script['種類'] : 'アンノウン'
          let typeChinese = '缺失'
          try {
            typeChinese = constants.CQHY_PERSONAL_SCRIPT_TYPE_MAPPING.find(
              (item) => {
                return item.jp === typeJapanese
              }
            ).cn
          } catch (e) {}

          let limitationJapanese = script['カテゴリ']
            ? script['カテゴリ']
            : 'アンノウン'
          let limitationChinese = '缺失'
          try {
            limitationChinese = constants.CQHY_PERSONAL_SCRIPT_SITUATION_MAPPING.find(
              (item) => {
                return item.jp === limitationJapanese
              }
            ).cn
          } catch (e) {}

          let limitationFixJapanese = ''
          let limitationFixChinese = ''
          if (script['条件']) {
            const limitationFixItem = utils.translateLimitation(script['条件'])

            limitationFixJapanese = limitationFixItem.jp
            limitationFixChinese = limitationFixItem.cn
          }

          limitationFixJapanese &&
            (limitationJapanese = `${limitationJapanese}(${limitationFixJapanese})`)
          limitationFixChinese &&
            (limitationChinese = `${limitationChinese}(${limitationFixChinese})`)

          const contentJapanese = japanesePersonalScriptSheet[index]['台詞']
          const contentChinese = script['台詞']

          singleFileJapaneseValues.push({
            type: typeJapanese,
            limitation: limitationJapanese,
            content: contentJapanese,
          })

          singleFileChineseValues.push({
            type: typeChinese,
            limitation: limitationChinese,
            content: contentChinese,
          })
        })

        // 判断是否已经存在对应信息
        const tempData = personalScripts.find((item) => {
          return item[1][0] === id
        })

        if (!tempData) {
          // 基础台词
          if (fileId.length <= 3)
            personalScripts.push([
              personalKeys,
              [
                id,
                JSON.stringify(singleFileChineseValues),
                JSON.stringify(singleFileJapaneseValues),
                '',
                '',
              ],
            ])
          // 皮肤台词
          else
            personalScripts.push([
              personalKeys,
              [
                id,
                '',
                '',
                JSON.stringify(singleFileChineseValues),
                JSON.stringify(singleFileJapaneseValues),
              ],
            ])
        } else {
          if (fileId.length <= 3) {
            // 基础台词
            tempData[1][1] = JSON.stringify(singleFileChineseValues)
            tempData[1][2] = JSON.stringify(singleFileJapaneseValues)
          } else {
            // 皮肤台词
            tempData[1][3] = JSON.stringify(singleFileChineseValues)
            tempData[1][4] = JSON.stringify(singleFileJapaneseValues)
          }
        }
      }

      if (reactionScriptSheet.length != 0) {
        // 处理对话数据
        reactionScriptSheet.map((script, index) => {
          const speakerId = mist.find((item) => {
            return item.jp === script['発言者']
          }).id

          const listenerIndex = index % 2 === 0 ? index + 1 : index -1
          const listenerId = mist.find((item) => {
            return item.jp === reactionScriptSheet[listenerIndex]['発言者']
          }).id

          const japaneseReactionScript =
            japaneseReactionScriptSheet[index]['台詞']

          reactionScripts.push([
            reactionKeys,
            [id, speakerId, listenerId, script['台詞'], japaneseReactionScript],
          ])
        })
      }
    }
  })

  const personalPromise = new Promise((resolve, reject) => {
    utils.progressiveDataBaseWork(dmDAO, 'insertCQHYPersonalScripts', personalScripts, () => {
      resolve()
    })
  })

  const reactionPromise = new Promise((resolve, reject) => {
    utils.progressiveDataBaseWork(dmDAO, 'insertCQHYReactionScripts', reactionScripts, () => {
      resolve()
    })
  })

  const fullPromise = Promise.all([personalPromise, reactionPromise])
  
  fullPromise.then(() => {
    onSuccess('录入完成。')
  })
}

module.exports = {
  insertZJSNRShipInformationService,
  insertZJSNREquipmentInformationService,
  parseZJSNREquipmentShipType,
  parseZJSNROfflineData,
  enteringCannonryOrderingData,
  createShipNameMapping,
  insertZJSNREnemyInformationService,
  insertCQHYScripts,
}
