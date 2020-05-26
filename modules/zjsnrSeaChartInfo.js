const constants = require('../lib/constants')

const generateMapSetting = origin => {
  let temp = JSON.parse(origin)

  if (temp.display) {
      let displayList = temp.display.split(constants.SECONDARY_SEPARATE_MARK).map(item => {
          return JSON.parse(item)
      })

      temp.display = displayList
  }

  return temp
}

class zjsnrSeaChartInfo {
  constructor(params) {
    for (let key in params) {
      if (key === 'enemyInfo') {
        let tempInfoList = params[key]
          .split(constants.SEPARATE_MARK)
          .map(info => {
            let tempInfo = JSON.parse(info)

            try {
              Object.keys(tempInfo.setting).length > 0 &&
                (tempInfo.setting = generateMapSetting(tempInfo.setting))
            } catch (e) {
              console.log(`${params.map}-A`, tempInfo.setting)
            }

            try {
              Object.keys(tempInfo.setting2).length > 0 &&
                (tempInfo.setting2 = generateMapSetting(tempInfo.setting2))
            } catch (e) {
              console.log(`${params.map}-B`, tempInfo.setting2)
            }

            try {
              tempInfo.setting3 &&
                Object.keys(tempInfo.setting3).length > 0 &&
                (tempInfo.setting3 = generateMapSetting(tempInfo.setting3))
            } catch (e) {
              console.log(`${params.map}-C`, tempInfo.setting3)
            }

            return tempInfo
          })

        this[key] = tempInfoList
      } else this[key] = params[key]
    }
  }
}

module.exports = zjsnrSeaChartInfo
