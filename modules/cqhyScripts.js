const mistChar = require('../lib/mistCharacters')

class mistScripts {
  constructor(personalScripts, reactionScripts) {
    try {
      const personalScriptItem = personalScripts[0]
      const id = personalScriptItem.dexIndex
      const shipNames = mistChar.find((item) => {
        return item.id === id
      })

      const defaultJanpaneseScripts = JSON.parse(
        personalScriptItem.defaultJapanese
      )
      const defaultChineseScripts = JSON.parse(
        personalScriptItem.defaultChinese
      )
      let skinJapaneseScripts = ''
      let skinChineseScripts = ''

      personalScriptItem.skinJapanese &&
        (skinJapaneseScripts = JSON.parse(personalScriptItem.skinJapanese))
      personalScriptItem.skinChinese &&
        (skinChineseScripts = JSON.parse(personalScriptItem.skinChinese))

      let groupedJapaneseReactionScripts = []
      let groupedChineseReactionScripts = []
      let singleJapaneseReactionScript = []
      let singleChineseReactionScript = []
      reactionScripts.map((script, index) => {
        const speakerNames = mistChar.find((item) => {
          return item.id === script.speaker
        })
        let japaneseName = speakerNames.jp
        let chineseName = speakerNames.cn
        if (script.speaker > 9000) {
          japaneseName = `${japaneseName}(未実装)`
          chineseName = `${japaneseName}(未实装)`
        }
        if (index % 4 === 0) {
          singleJapaneseReactionScript = []
          singleChineseReactionScript = []
          singleJapaneseReactionScript.push({
            speakerId: script.speaker,
            speakerName: japaneseName,
            content: script.japanese,
          })
          singleChineseReactionScript.push({
            speakerId: script.speaker,
            speakerName: chineseName,
            content: script.chinese,
          })
        } else if (index % 4 === 3) {
          singleJapaneseReactionScript.push({
            speakerId: script.speaker,
            speakerName: japaneseName,
            content: script.japanese,
          })
          singleChineseReactionScript.push({
            speakerId: script.speaker,
            speakerName: chineseName,
            content: script.chinese,
          })
          groupedJapaneseReactionScripts.push(
            Object.assign([], singleJapaneseReactionScript)
          )
          groupedChineseReactionScripts.push(
            Object.assign([], singleChineseReactionScript)
          )
        } else {
          singleJapaneseReactionScript.push({
            speakerId: script.speaker,
            speakerName: japaneseName,
            content: script.japanese,
          })
          singleChineseReactionScript.push({
            speakerId: script.speaker,
            speakerName: chineseName,
            content: script.chinese,
          })
        }
      })

      this.jp = {
        id: id,
        name: shipNames.jp,

        personalScripts: defaultJanpaneseScripts,
        skinScripts: skinJapaneseScripts,
        reactionScriptGroups: groupedJapaneseReactionScripts,
      }

      this.cn = {
        id: id,
        name: shipNames.cn,
        personalScripts: defaultChineseScripts,
        skinScripts: skinChineseScripts,
        reactionScriptGroups: groupedChineseReactionScripts,
      }
    } catch (e) {
      this.errCode = 999
    }
  }
}

module.exports = mistScripts
