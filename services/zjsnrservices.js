const path = require('path')

const nodes = require('../lib/nodes')
const utils = require('../lib/utils')
const constants = require('../lib/constants')
const zjsnrDao = require('../dao/zjsnrdao')
const cidMapping = require('../lib/cid')

async function queryShipsInfo(query, onSuccess) {
  let addtionalOptions = {}

  if (query.nationalities.trim()) {
    const nationalities = query.nationalities.split(',')
    if (nationalities.length !== constants.ZJSNR_SHIP_NATIONALITY.length) {
      addtionalOptions.nationality = []
      nationalities.map((nationality) => {
        const content = constants.ZJSNR_SHIP_NATIONALITY.find((item) => {
          return item.id === Number(nationality)
        }).title
        switch (typeof content) {
          case 'string':
            addtionalOptions.nationality.push(content)
            break
          case 'object':
            Array.isArray(content) &&
              content.map((contentItem) => {
                addtionalOptions.nationality.push(contentItem)
              })
            break
        }
      })
    }
  }

  if (query.types.trim()) {
    const types = query.types.split(',')
    if (types.length !== constants.ZJSNR_SHIP_TYPES.length)
      addtionalOptions.type = types.map((type) => {
        return constants.ZJSNR_SHIP_TYPES.find((item) => {
          return item.id === Number(type)
        }).title
      })
  }

  if (query.dimensions.trim()) {
    const dimensions = query.dimensions.split(',')
    if (dimensions.length !== constants.ZJSNR_SHIP_DIMENSIONS.length)
      addtionalOptions.dimension = dimensions.map((type) => {
        return constants.ZJSNR_SHIP_DIMENSIONS.find((item) => {
          return item.id === Number(type)
        }).title
      })
  }

  if (query.costs.trim()) {
    const costs = query.costs.split(',')
    if (costs.length !== constants.ZJSNR_SHIP_COSTS.length)
      addtionalOptions.cost = costs.map((type) => {
        return constants.ZJSNR_SHIP_COSTS.find((item) => {
          return item.id === Number(type)
        }).title
      })
  }

  query.orderBy = constants.ZJSNR_SHIP_ORDERS[Number(query.sortKey)]

  query.keyColumn = Number(query.keyWord) ? 'dexIndex' : 'name'

  onSuccess(
    await zjsnrDao.queryShipsInfo(
      query,
      addtionalOptions,
      'LEFT JOIN war_ship_girls_custom_evaluation ON dexIndex = `index`'
    )
  )
}

async function queryEquipmentsInfo(query, onSuccess) {
  const type = Number(query.type)
  if (type < 38)
    onSuccess(
      await zjsnrDao.queryEquipmentsInfo(
        Object.assign(constants.EQUIPMENT_TYPE_MAPPING[type], {
          sequence: query.sequence,
        })
      )
    )
  else if (type === 38)
    onSuccess(
      (result = await zjsnrDao.queryAntiSubmarineBasedEquipmentsInfo(
        query.sequence
      ))
    )
  else if (type === 39 || type === 40)
    onSuccess(
      (result = await zjsnrDao.querySpecialEffectBasedEquipmentsInfo(
        constants.EQUIPMENT_SPECIAL_EFFECT_KEY_MAPPING[type],
        query.sequence
      ))
    )
  else if (type === 41)
    onSuccess(
      (result = await zjsnrDao.queryLifeBasedEquipmentsInfo(query.sequence))
    )
  else if (type === 42)
    onSuccess((result = await zjsnrDao.querySpecialEffectEquipmentsInfo()))
}

const getSpecificIllustrations = (baseId, files, isUpdated, prefix) => {
  let specialFiles = []
  files.forEach((file) => {
    if (file.indexOf(baseId) >= 0) {
      const fileDetailList = file.split('_')
      let picId
      if (fileDetailList.length === 4) {
        picId = Number(fileDetailList[2])
        // 先获取所有皮肤的立绘
        if (picId === parseInt(baseId)) specialFiles.push(`${prefix}${file}`)
      } else {
        // 再获取基础立绘
        picId = Number(fileDetailList[2].split('.')[0])
        const usefulId = isUpdated ? baseId + 1000 : baseId
        picId === parseInt(usefulId) && specialFiles.unshift(`${prefix}${file}`)
      }
    }
  })
  return specialFiles
}

async function queryShipsIllustrations(id, onSuccess) {
  const illustrations = []
  const normalIllustrationPath = path.join(
    __dirname,
    constants.ZJSNR_ROOT_PATH,
    '/illustration/ships/L/NORMAL/'
  )
  const normalIllustrations = await utils.scanFiles(normalIllustrationPath)

  const brokenIllustrationPath = path.join(
    __dirname,
    constants.ZJSNR_ROOT_PATH,
    '/illustration/ships/L/BROKEN/'
  )
  const brokenIllustrations = await utils.scanFiles(brokenIllustrationPath)

  let normalSpecificIllustrations = []
  let brokenSpecificIllustrations = []
  if (id > 999 && id < 2000) {
    // 改造后的船
    const baseId = id - 1000
    normalSpecificIllustrations = getSpecificIllustrations(
      baseId,
      normalIllustrations,
      true,
      '/illustration/ships/L/NORMAL/'
    )
    brokenSpecificIllustrations = getSpecificIllustrations(
      baseId,
      brokenIllustrations,
      true,
      '/illustration/ships/L/BROKEN/'
    )
  } else if (id >= 8000) {
    // 特殊船
    normalSpecificIllustrations = getSpecificIllustrations(
      id,
      normalIllustrations,
      false,
      '/illustration/ships/L/NORMAL/'
    )
    brokenSpecificIllustrations = getSpecificIllustrations(
      id,
      brokenIllustrations,
      false,
      '/illustration/ships/L/BROKEN/'
    )
  } else {
    // 普通船
    normalSpecificIllustrations = getSpecificIllustrations(
      id,
      normalIllustrations,
      false,
      '/illustration/ships/L/NORMAL/'
    )
    brokenSpecificIllustrations = getSpecificIllustrations(
      id,
      brokenIllustrations,
      false,
      '/illustration/ships/L/BROKEN/'
    )
  }

  normalSpecificIllustrations.forEach((illustration, index) => {
    illustrations.push(illustration)
    brokenSpecificIllustrations[index] &&
      illustrations.push(brokenSpecificIllustrations[index])
  })

  onSuccess(illustrations)
}

const sortDataList = (list) => {
  list.sort((a, b) => {
    return -(a.scale - b.scale)
  })
}

const switchNode2NodeName = (node) => {
  return nodes.NODES.find((item) => {
    return Number(item.id) === Number(node)
  }).node_name
}

async function queryAcquireRoute(cid, onSuccess) {
  // 从魔盒API获取全部统计数据
  const buildingTimeArea =
    '20191111_v,20191119_v,20191213_hd,20191227_v,20200117_hd,20200207_v,20200306_sj,20200309_v,20200317_v,20200326_v'
  const droppingTimeArea =
    '20190704_v,20190710_v,20190816_v,20190823_sj,20190826_v,20190911_v,20191017_v,20191018_v,20191101_v,20191108_sj,20191111_v,20191119_v,20191227_v,20200207_v,20200306_sj,20200309_v,20200317_v,20200326_v'
  const queryType = 0
  const buildingData = await utils.getThirdPartyPromise(
    `http://www.jianrmod.cn/data/queryBuildTable.do?cid=${cid}&type=${queryType}&timePart=${buildingTimeArea}`,
    'get'
  )
  const droppingData = await utils.getThirdPartyPromise(
    `http://www.jianrmod.cn/data/queryDropTable.do?cid=${cid}&type=${queryType}&timePart=${droppingTimeArea}`,
    'get'
  )

  let validBuildingDetailData = []
  let validBuildingSimpleData = []
  let validDroppingDetailData = []
  let validDroppingSimpleData = []

  buildingData.map((data) => {
    // 样本足够多的时候才会显示在简要数据页面。详情页可以保留尽可能多的数据
    if (data.C_form > 1000)
      validBuildingSimpleData.push(
        Object.assign(data, {
          scale: Number((data.C / data.C_form).toFixed(4)),
        })
      )
    if (data.C_form > 100)
      validBuildingDetailData.push(
        Object.assign(data, {
          scale: Number((data.C / data.C_form).toFixed(4)),
        })
      )
  })

  droppingData.map((data) => {
    // 样本足够多的时候才会显示在简要数据页面。详情页可以保留尽可能多的数据
    if (data.C_node > 10000)
      validDroppingSimpleData.push(
        Object.assign(data, {
          scale: Number((data.C / data.C_node).toFixed(4)),
          nodeName: switchNode2NodeName(data.node),
        })
      )
    if (data.C_node > 1000)
      validDroppingDetailData.push(
        Object.assign(data, {
          scale: Number((data.C / data.C_node).toFixed(4)),
          nodeName: switchNode2NodeName(data.node),
        })
      )
  })

  sortDataList(validBuildingSimpleData)
  sortDataList(validBuildingDetailData)
  sortDataList(validDroppingSimpleData)
  sortDataList(validDroppingDetailData)

  onSuccess({
    build: {
      simple: validBuildingSimpleData.slice(0, 3),
      detail: validBuildingDetailData,
    },
    drop: {
      simple: validDroppingSimpleData.slice(0, 3),
      detail: validDroppingDetailData,
    },
  })
}

async function queryRelatedShipInfo(id, onSuccess) {
  let shipInfo
  // 大于1000为改造船，反之需要为没改的
  if (id > 1000)
    shipInfo = await zjsnrDao.getOriginalShipInfo(
      id - 1000,
      'LEFT JOIN war_ship_girls_custom_evaluation ON dexIndex = `index`'
    )
  else if (id < 1000)
    shipInfo = await zjsnrDao.getOriginalShipInfo(
      id + 1000,
      'LEFT JOIN war_ship_girls_custom_evaluation ON dexIndex = `index`'
    )

  onSuccess(shipInfo)
}

const fetchFormula = (type, onSuccess) => {
  let data

  switch (type) {
    case 'building':
      data = {
        title: '建造公式',
        headerItemList: ['油', '弹', '钢', '铝', '说明', '注释'],
        columnWidth: ['10%', '10%', '10%', '10%', '20%', '40%'],
        contentList: [
          [
            400,
            130,
            500,
            400,
            '航母低耗',
            '含紫轻巡，但相对高耗公式航系整体出率约降低15%，不需求追赶者请把铝降到300',
          ],
          [
            500,
            130,
            600,
            400,
            '航母通用',
            '屏蔽紫色轻巡；不需求追赶者请把铝降到300',
          ],
          [250, 30, 300, 300, '轻母公式', '屏蔽重巡，含轻巡'],
          [
            400,
            80,
            650,
            101,
            '战列通用',
            '弹改30可屏蔽狮/密苏里；钢改600可屏蔽狮/前卫/密苏里/华盛顿；弹铝改130可屏蔽拉菲',
          ],
          [500, 130, 650, 231, '战列高耗', '屏蔽大多数小船，含导驱/防驱'],
          [400, 30, 500, 101, '战巡/重巡特化', ' '],
          [200, 30, 200, 30, '轻巡通用', '含U96/U35/女灶神'],
          [
            130,
            30,
            130,
            30,
            '轻巡低耗',
            '含U96/U35/Z24/Z28，屏蔽女灶神；油钢改120可屏蔽z24/z28/贝尔法斯特/爱丁堡',
          ],
          [30, 100, 100, 30, '雷巡特化', '轻巡公式弹改100也可以赌雷巡'],
          [200, 130, 200, 200, '导驱/防驱特化', '航母公式/战列高耗均可出'],
          [30, 30, 60, 30, '潜艇低耗', '不出U96/U35，含Z24/Z28外的1/2星驱逐'],
          [50, 200, 100, 30, '炮潜低耗', '轻巡公式弹改200也可以赌炮潜'],
        ],
      }
      break
    case 'development':
      data = {
        title: '开发公式',
        explaination: '注：装备开发阈值为该装备拆解所得资源*10',
        headerItemList: ['油', '弹', '钢', '铝', '说明', '注释'],
        columnWidth: ['10%', '10%', '10%', '10%', '20%', '40%'],
        contentList: [
          [10, 90, 90, 30, '穿甲弹阈值公式', ' '],
          [20, 90, 90, 30, '穿甲弹高耗', '可兼顾彗星'],
          [10, 130, 210, 10, 'MK6阈值', ' '],
          [10, 130, 210, 30, 'MK6高耗', '可兼顾穿甲弹'],
          [30, 60, 10, 130, '飞龙阈值', '含流星'],
          [20, 20, 10, 130, 'F4U-7、海毒牙阈值', ' '],
          [10, 30, 10, 20, '深弹兼顾声呐', ' '],
          [20, 30, 10, 30, 'BTD、彗星阈值', '可兼顾反潜套装'],
        ],
      }
      break
  }

  onSuccess(data)
}

async function queryExpeditions(onSuccess) {
  const data = await zjsnrDao.queryExpeditions()

  onSuccess(data)
}

async function queryCannonryOrder(query, onSuccess) {
  let condition = []
  for (let key in query) {
    condition.push({
      column: key,
      value:
        constants.ZJSNR_CANNONRY_ORDER_KEY_VALUE_PAIRING[Number(query[key])],
    })
  }
  const data = await zjsnrDao.queryCannonryOrder(condition)

  onSuccess(data[0] ? data[0].cannonryOrder : '')
}

async function queryBuildTime(type, onSuccess) {
  const result = await zjsnrDao.queryBuildTime(type)

  onSuccess(result)
}

async function queryDropInfo(options, onSuccess) {
  const droppingTimeArea =
    '20190704_v,20190710_v,20190816_v,20190823_sj,20190826_v,20190911_v,20191017_v,20191018_v,20191101_v,20191108_sj,20191111_v,20191119_v,20191227_v,20200207_v,20200306_sj,20200309_v,20200317_v,20200326_v'

  const node = nodes.NODES.find((item) => {
    return item.chapter_name === options.map && item.flag === options.point
  }).id

  const droppingData = await utils.getThirdPartyPromise(
    `http://www.jianrmod.cn/data/queryDropInfo.do?node=${node}&timePart=${droppingTimeArea}`,
    'get'
  )

  let finalData = []
  droppingData.map((item) => {
    if (Number(item.ship) !== 0) {
      const mappingInfo = cidMapping.find((mapping) => {
        return mapping.cid === item.ship
      })
      finalData.push(Object.assign(item, mappingInfo))
    }
  })

  onSuccess(finalData)
}

async function querySeaChartInfo(onSuccess) {
  const result = await zjsnrDao.querySeaChartInfo()

  onSuccess(result)
}

async function queryShipInfo(id, onSuccess) {
  const result = await zjsnrDao.queryShipInfo(
    id,
    'LEFT JOIN war_ship_girls_custom_evaluation ON dexIndex = `index`'
  )

  onSuccess(result)
}

async function queryAcademyInfo(onSuccess) {
  const results = await zjsnrDao.queryAcademyInfo()

  let response = []
  results.map((result) => {
    if (
      !response.find((item) => {
        return item.teacher === result.teacher
      })
    ) {
      let tempItem = {
        teacher: result.teacher,
      }
      tempItem.lessons = {}
      tempItem.lessons[result.phase] = [result]

      response.push(tempItem)
    } else {
      let contentWithCurrentTeacher = response.find((item) => {
        return item.teacher === result.teacher
      })

      if (!contentWithCurrentTeacher.lessons[result.phase]) {
        contentWithCurrentTeacher.lessons[result.phase] = [result]
      } else {
        contentWithCurrentTeacher.lessons[result.phase].push(result)
      }
    }
  })

  onSuccess(response)
}

async function queryMenuInfo(onSuccess) {
  const results = await zjsnrDao.queryMenuInfo()

  onSuccess(results)
}

async function setCustomEvaluation(content, onSuccess) {
  content = [
    {
      index: 1,
      evaluation: 0,
      playerDesc: 'test',
    },
    {
      index: 12,
      evaluation: 1,
      playerDesc: 'test22222',
    },
  ]

  utils.progressiveDataBaseWork(zjsnrDao, 'setEvaluation', content, onSuccess)
}

module.exports = {
  queryShipsInfo,
  queryEquipmentsInfo,
  queryShipsIllustrations,
  queryAcquireRoute,
  queryRelatedShipInfo,
  fetchFormula,
  queryExpeditions,
  queryCannonryOrder,
  queryBuildTime,
  queryDropInfo,
  querySeaChartInfo,
  queryShipInfo,
  queryAcademyInfo,
  queryMenuInfo,
  setCustomEvaluation,
}
