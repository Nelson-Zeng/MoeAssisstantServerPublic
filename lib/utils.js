const fs = require("fs")
const path = require("path")
const http = require("http")
const XLSX = require("xlsx")

// 用来保存不同的递进式请求方法
const progressiveDataBaseWorkContainer = {}

/**
 * 将传入字符串的首字母转换成大写
 * @param {String} word 需要转换的字符串
 */
const turnFirstLetter2UperCase = (word) => {
  const firstLetterInUpperCase = word.slice(0, 1).toUpperCase()
  return word.replace(new RegExp(/^\w{1}/), firstLetterInUpperCase)
}

/**
 * 获取数据库sql insert语句中对应values字符串的？占位符
 * @param {Array} values 需要传入的值的数组
 */
const getValuePlaceHolder = (values) => {
  let valuePlaceHolderArr = []
  let index = 0
  const len = values.length
  while (index < len) {
    valuePlaceHolderArr.push("?")
    index++
  }
  return valuePlaceHolderArr.join(", ")
}

const readSingleFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      resolve(data)
    })
  })
}

const readXLSX = (path) => {
  return XLSX.readFile(path)
}

/**
 * 读取指定文件夹下所有文件的文件名，返回值为文件名数组
 * @param {String} dictionaryPath
 */
const scanFiles = (dictionaryPath, analysis) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dictionaryPath, (err, files) => {
      resolve(files)
    })
  })
}

/**
 * 读取指定文件夹下所有文件的异步方法，返回值为解析出的数据对象
 * @param {String} dictionaryPath 文件夹路径
 * @param {Function} dataOperationFuc 文件数据解析方法
 */
const readFiles = (dictionaryPath, dataOperationFuc) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dictionaryPath, (err, files) => {
      let readFilePromiseArr = []

      files.forEach((file) => {
        readFilePromiseArr.push(
          new Promise((resolve, reject) => {
            fs.readFile(path.join(dictionaryPath, file), (err, data) => {
              resolve(dataOperationFuc(data))
            })
          })
        )
      })

      Promise.all(readFilePromiseArr).then((results) => {
        resolve(results)
      })
    })
  })
}

/**
 * 在预设的对象中注入特定方法实现不同的递进式请求同时通过该工具函数触发而不产生混淆
 * @param {Object} dao dao层对象
 * @param {String} func 需要调用的dao层方法
 * @param {Array} items 数据内容组成的数组
 * @param {Function} onSucceess 数据库操作全部完成的回调方法
 */
const progressiveDataBaseWork = (dao, func, items, onSucceess) => {
  let results = []

  const currentFunc = (progressiveDataBaseWorkContainer[
    `${dao}${turnFirstLetter2UperCase(func)}`
  ] = (items, index) => {
    const currentItem = items[index - 1]
    if (Array.isArray(currentItem))
      dao[func](...currentItem)
        .then((result) => {
          if (index < items.length) {
            console.log(index)
            currentFunc(items, ++index)
          } else onSucceess()
        })
        .catch((err) => {
          console.log(err)
        })
    else if (typeof currentItem === "object")
      dao[func](currentItem)
        .then((result) => {
          if (index < items.length) {
            console.log(index)
            currentFunc(items, ++index)
          } else onSucceess()
        })
        .catch((err) => {
          console.log(err)
        })
    else if (typeof currentItem === "string") {
      dao[func](currentItem)
        .then((result) => {
          results.push(result)
          if (index < items.length) {
            // console.log(index)
            currentFunc(items, ++index)
          } else onSucceess(results)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  })

  currentFunc(items, 1)
}

const getThirdPartyPromise = (url, method) => {
  return new Promise((resolve, reject) => {
    http[method](url, (res) => {
      res.setEncoding("utf8")

      let rawData = ""
      res.on("data", (chunk) => {
        rawData += chunk
      })
      res.on("end", () => {
        try {
          const parsedData = JSON.parse(rawData)
          resolve(parsedData.data)
        } catch (e) {
          reject(e.message)
        }
      })
    })
  })
}

const getOriginAverage = function () {
  if (this.length === 0) return 0

  const sum = this.reduce((a, b) => {
    return a + b
  })
  return sum / this.length
}

const getAverage = function (isInt = true) {
  const temp = getOriginAverage.call(this)

  return isInt ? Math.ceil(temp) : Number(temp.toFixed(1))
}

function consecutiveReplace() {
  let allArguments = []

  let args = Array.prototype.slice.call(arguments)
  let string = args[0]

  function endReplace() {
    return endReplace
  }

  function progressReplace() {
    const _args = Array.prototype.slice.call(arguments)

    allArguments.push(_args)

    // 特殊情况下提前中断替换
    if (_args.length === 3 && _args[2] && string.includes(_args[0]))
      return endReplace

    return progressReplace
  }

  progressReplace.toString = () => {
    allArguments.map((argPair) => {
      string = string.replace(argPair[0], argPair[1])
    })

    return string
  }

  endReplace.toString = () => {
    allArguments.map((argPair) => {
      string = string.replace(argPair[0], argPair[1])
    })

    return string
  }

  return progressReplace
}

const translateLimitation = (str) => {
  const japaneseLimitation = consecutiveReplace(str)(
    "風速8m以上",
    "風速>8m/s",
    true
  )("風速4m以下", "風速<4m/s", true)("8m>風速>3m", "3m/s<風速<8m/s", true)(
    "2020年1月1日",
    "元旦",
    true
  )("2019年4月21日", "イースター", true)("1月1日", "元旦", true)(
    "2019年4月21日\r\n2020年4月12日\r\n2021年4月4日",
    "イースター",
    true
  )("ヴァレンタイン", "バレンタイン", true)(
    "2019年4月21日\r\n2020年4月12日",
    "イースター",
    true
  )("2018年11月22日\r\n2019年11月28日", "サンクスギビング·デイ", true)(
    "12月24日",
    "クリスマスイブ",
    true
  )("2020年2月14日", "バレンタイン", true)(
    "2020年4月1日",
    "エイプリルフール",
    true
  )("10月31日", "ハロウインイブ", true)(
    "2019年10月30日",
    "ハロウインイブ",
    true
  )("2019年12月25日", "クリスマス", true)("3-8後", "3-8以後", true)(
    "3-8以后",
    "4-7以後",
    true
  )("6月23日", "クインシーの誕生日", true)("3-8之后", "3-8以後", true)(
    "2019年4月21日、2020年4月12日",
    "イースター",
    true
  )("3-8以降\r\n>100", "3-8以降・>100", true)(
    "晴、風速<10m/s",
    "晴・風速<10m/s",
    true
  )("10月3日", "German Unity Day", true)("2月28日", "Bachelor's Day", true)(
    "6月18日",
    "Battle of Waterloo",
    true
  )("2月13日", "バレンタインイブ", true)(
    "10月21日",
    "アドミラルネルソンの忌日",
    true
  )("3-7後", "4-6以後", true)("2月14日", "バレンタイン", true)(
    "4月1日",
    "エイプリルフール",
    true
  )("12月25日", "クリスマス", true)("風速3m以下", "風速<3m/s", true)(
    "5月1日",
    "International Workers' Day",
    true
  )("5月8日", "Victory in Europe Day", true)(
    "7月14日",
    "France national day",
    true
  )("1月6日", "公現祭", true)(
    "2019年4月21日\r\n2020年4月12日\r\n2021年4月4日",
    "イースター",
    true
  )("11月2日", "All Souls' Day", true)("4月21日（変動）", "イースター", true)(
    "7月4日",
    "アメリカ独立記念日",
    true
  )("5月5日", "こどもの日", true)("7月7日", "七夕", true)(
    "9月23日",
    "秋分",
    true
  )("12月31日", "大晦日", true)("上午/下午 00時00分00秒 ", "", true)(
    "7月4日",
    "アメリカ独立記念日",
    true
  )("11月11日", "Veterans Day", true)("43101", "元旦", true)(
    "43145",
    "バレンタイン",
    true
  )("43191", "エイプリルフール", true)("43404", "ハロウイン", true)(
    "43285",
    "アメリカ独立記念日",
    true
  )("5月最後の月曜日", "アメリカ戦没将兵追悼記念日", true)(
    "43287",
    "ワクチンの日",
    true
  )("43404", "ハロウイン", true)("43459", "クリスマス", true)(
    "8月15日",
    "終戦記念日",
    true
  )("2019年11月28日", "サンクスギビング·デイ", true)(
    "2019年4月21日（変動）",
    "イースター",
    true
  )("2019年4月21日", "イースター", true)(
    "1月7日",
    "クリスマス（正教会）",
    true
  )("1月14日", "旧正月", true)(
    "2月23日",
    "Defender of the Fatherland Day",
    true
  )(
    "3月8日",
    "International Women's Day",
    true
  )(/([<>])(風速)/, (str, s1, s2) => {
    return `${s2}${s1}`
  })(/(風速)(\d*m)/, (match, s1, s2) => {
    return `${s1}<${s2}`
  })(/(風速[<>]\d*)(m)(?!\/s)/g, (match, s1, s2) => {
    return `${s1}m/s`
  })(/曇(?!り)/g, "曇り")("3-1", "4-0")("3-2", "4-1")("3-3", "4-2")(
    "3-4",
    "4-3"
  )("3-5", "4-4")("3-6", "4-5")("3-7", "4-6")("3-8", "4-7")("2-5", "3-1")(
    "2-6",
    "3-2"
  )("2-7", "3-3")("2-8", "3-4").toString()

  const chineseLimitation = consecutiveReplace(japaneseLimitation)(
    "快晴",
    "大晴天"
  )("曇り", "多云")("天気予報で", "天气预报：")("風速", "风速")("以降", "之后")(
    "バレンタイン",
    "情人节"
  )("エイプリルフール", "愚人节")("ハロウインイブ", "万圣节前夜")(
    "バレンタインイブ",
    "情人节前夜"
  )("クリスマスイブ", "圣诞夜")("クリスマス", "圣诞节")("晴れ", "晴")(
    "イースター",
    "复活节"
  )("サンクスギビング·デイ", "感恩节")("みぞれ", "风雪交加")(
    "クインシーの誕生日",
    "昆西下水日"
  )("ログイン後", "登录后")("German Unity Day", "东西德合并纪念日")(
    "ハロウィン",
    "万圣节"
  )("Bachelor's Day", "被求婚日")("Battle of Waterloo", "滑铁卢之战")(
    "アドミラルネルソンの忌日",
    "纳尔逊将军忌日"
  )("International Workers' Day", "劳动节")(
    "Victory in Europe Day",
    "欧洲胜利日"
  )("France national day", "法国国庆节")("公現祭", "主显节")(
    "All Souls' Day",
    "万灵节"
  )("アメリカ独立記念日", "美国独立日")("こどもの日", "日本男孩节")(
    "ハロウイン",
    "万圣节"
  )("アメリカ戦没将兵追悼記念日", "美国阵亡将士纪念日")(
    "ワクチンの日",
    "世界疫苗日"
  )("終戦記念日", "二战终战纪念日")("クリスマス（正教会）", "东正教圣诞节")(
    "旧正月",
    "东正教正月"
  )("Defender of the Fatherland Day", "祖国保卫者日")(
    "International Women's Day",
    "妇女节"
  ).toString()

  return { jp: japaneseLimitation, cn: chineseLimitation }
}

module.exports = {
  getValuePlaceHolder,
  readXLSX,
  readSingleFile,
  readFiles,
  progressiveDataBaseWork,
  scanFiles,
  getThirdPartyPromise,
  turnFirstLetter2UperCase,
  getAverage,
  translateLimitation,
}
