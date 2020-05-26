const fs = require('fs')
const path = require('path')

const ZJSNR_ROOT_PATH = '../public/zjsnr'
const CQHY_ROOT_PATH = '../public/cqhy'
const STRATEGY_ROOT_PATH = '../public/zjsnr/gamestrategy/'

const SEPARATE_MARK = '^v^'
const SECONDARY_SEPARATE_MARK = '^_^'

const CONFIG = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config.json')).toString()
)

const ZJNSR_SHIP_PARAMETER_MAPPING = [
  { key: 0, column: 'rarity', value: '稀有度' },
  { key: 1, column: 'type', value: '舰种' },
  { key: 2, column: 'shipClass', value: '舰级' },
  { key: 3, column: 'life', value: '耐久' },
  { key: 4, column: 'power', value: '火力' },
  { key: 5, column: 'armor', value: '装甲' },
  { key: 6, column: 'torpedo', value: '鱼雷' },
  { key: 7, column: 'antiAircraft', value: '对空' },
  { key: 8, column: 'antiSubmarine', value: '对潜' },
  { key: 9, column: 'tracking', value: '索敌' },
  { key: 10, column: 'evadeRate', value: '闪避' },
  { key: 11, column: 'hitRate', value: '命中' },
  { key: 12, column: 'luck', value: '幸运' },
  { key: 13, column: 'speed', value: '航速' },
  { key: 14, column: 'aircraftCapacity', value: '搭载' },
  { key: 15, column: 'fireRange', value: '射程' },
  { key: 16, column: 'dimension', value: '船型' },
  { key: 17, column: 'equipmentSlot', value: '装备槽' },
  { key: 18, column: 'originalEquipment', value: '初始装备' },
  { key: 19, column: 'fuel', value: '油料' },
  { key: 20, column: 'cartridge', value: '弹药' },
  { key: 21, column: 'fuelCosting', value: '修理油' },
  { key: 22, column: 'steelCosting', value: '修理钢' },
  { key: 23, column: 'timeCosting', value: '修理时间' },
  { key: 24, column: 'recyclingIncome', value: '拆解资源(油弹钢铝)' },
  { key: 25, column: 'enhancingIncome', value: '强化提供(火雷甲空)' },
  { key: 26, column: 'firstSkillTitle', value: '' },
  { key: 27, column: 'secondSkillTitle', value: '' },
  { key: 28, column: 'firstSkill', value: '技能1' },
  { key: 29, column: 'secondSkill', value: '技能2' },
  { key: 30, column: 'powerMax', value: '' },
  { key: 31, column: 'torpedoMax', value: '' },
  { key: 32, column: 'cost', value: 'Cost' },
]

const ZJSNR_EQUIPMENT_PARAMETER_MAPPING = [
  { key: 0, column: 'rarity', value: '稀有度' },
  { key: 1, column: 'type', value: '类型' },
  { key: 2, column: 'power', value: '火力' },
  { key: 3, column: 'antiSubmarine', value: '对潜' },
  { key: 4, column: 'tracking', value: '索敌' },
  { key: 5, column: 'hitRate', value: '命中' },
  { key: 6, column: 'evadeRate', value: '闪避' },
  { key: 7, column: 'antiAircraftTime', value: '防空倍率' },
  { key: 8, column: 'recyclingIncome', value: '拆解资源(油弹钢铝)' },
  { key: 9, column: 'torpedo', value: '鱼雷' },
  { key: 10, column: 'fireRange', value: '射程' },
  { key: 11, column: 'antiAircraft', value: '对空' },
  { key: 12, column: 'antiAircraftSubsidy', value: '对空补正' },
  { key: 13, column: 'specialEffect', value: '特殊效果' },
  { key: 14, column: 'luck', value: '幸运' },
  { key: 15, column: 'bomber', value: '轰炸' },
  { key: 16, column: 'aluminiumCost', value: '铝耗' },
  { key: 17, column: 'armor', value: '装甲' },
  { key: 18, column: 'life', value: '耐久' },
  { key: 19, column: 'penetration', value: '突防' },
  { key: 20, column: 'intercept', value: '拦截' },
]

const ZJSNR_ENEMY_PARAMETER_MAPPING = [
  { key: 0, column: 'level', value: '等级' },
  { key: 1, column: 'rarity', value: '稀有度' },
  { key: 2, column: 'type', value: '舰种' },
  { key: 3, column: 'life', value: '耐久' },
  { key: 4, column: 'power', value: '火力' },
  { key: 5, column: 'armor', value: '装甲' },
  { key: 6, column: 'torpedo', value: '鱼雷' },
  { key: 7, column: 'antiAircraft', value: '对空' },
  { key: 8, column: 'antiSubmarine', value: '对潜' },
  { key: 9, column: 'tracking', value: '索敌' },
  { key: 10, column: 'evadeRate', value: '闪避' },
  { key: 11, column: 'speed', value: '航速' },
  { key: 12, column: 'carrying', value: '搭载' },
  { key: 13, column: 'range', value: '射程' },
  { key: 14, column: 'demision', value: '船型' },
  { key: 15, column: 'equipment', value: '装备' },
]

const ZJSNR_EQUIPMENT_TYPE_ORDER_KEY_MAPPING = [
  { type: '主炮', orderKey: 'power' },
  { type: '侦察机', orderKey: 'tracking' },
  { type: '修理员', orderKey: 'dexIndex' },
  { type: '副炮', orderKey: 'tracking' },
  { type: '反潜设备', orderKey: 'antiSubmarine' },
  { type: '反舰导弹', orderKey: 'power' },
  { type: '反舰导弹发射器', orderKey: 'dexIndex' },
  { type: '强化部件', orderKey: 'dexIndex' },
  { type: '战斗机', orderKey: 'antiAircraft' },
  { type: '炮弹', orderKey: 'dexIndex' },
  { type: '轰炸机', orderKey: 'bomber' },
  { type: '防空导弹', orderKey: 'antiAircraft' },
  { type: '防空导弹发射器', orderKey: 'dexIndex' },
  { type: '防空炮', orderKey: 'dexIndex' },
  { type: '雷达', orderKey: 'tracking' },
]

const ZJSNR_SHIP_NATIONALITY = [
  { id: 0, title: '中国' },
  { id: 1, title: '英国' },
  { id: 2, title: '法国' },
  { id: 3, title: '德国' },
  { id: 4, title: '意大利' },
  { id: 5, title: '日本' },
  { id: 6, title: '苏联' },
  { id: 7, title: '美国' },
  {
    id: 8,
    title: [
      '冰岛',
      '加拿大',
      '南斯拉夫',
      '土耳其',
      '奥匈帝国',
      '希腊',
      '智利',
      '波兰',
      '泰国',
      '澳大利亚',
      '瑞典',
      '芬兰',
      '荷兰',
      '蒙古',
      '西班牙',
    ],
  },
]

const ZJSNR_SHIP_TYPES = [
  { id: 0, title: '航母' },
  { id: 1, title: '轻母' },
  { id: 2, title: '装母' },
  { id: 3, title: '战列' },
  { id: 4, title: '航战' },
  { id: 5, title: '战巡' },
  { id: 6, title: '重巡' },
  { id: 7, title: '航巡' },
  { id: 8, title: '雷巡' },
  { id: 9, title: '轻巡' },
  { id: 10, title: '重炮' },
  { id: 11, title: '驱逐' },
  { id: 12, title: '潜艇' },
  { id: 13, title: '炮潜' },
  { id: 14, title: '补给' },
  { id: 15, title: '导驱' },
  { id: 16, title: '防驱' },
  { id: 17, title: '防战' },
]

const ZJSNR_SHIP_DIMENSIONS = [
  { id: 0, title: '大型' },
  { id: 1, title: '中型' },
  { id: 2, title: '小型' },
]

const ZJSNR_SHIP_COSTS = [
  { id: 0, title: 0 },
  { id: 1, title: 1 },
  { id: 2, title: 2 },
  { id: 3, title: 3 },
  { id: 4, title: 4 },
  { id: 5, title: 5 },
  { id: 6, title: 6 },
  { id: 7, title: 7 },
]

const ZJSNR_SHIP_ORDERS = [
  'dexIndex',
  'powerMax',
  'torpedoMax',
  'life',
  'speed',
  'rarity',
]

const EQUIPMENT_TYPE_MAPPING = {
  0: { type: '主炮', orderType: 'power' },
  1: { type: '主炮-战列+', orderType: 'power' },
  2: { type: '主炮-炮潜', orderType: 'power' },
  3: { type: '主炮-轻巡+', orderType: 'power' },
  4: { type: '主炮-重巡+', orderType: 'power' },
  5: { type: '主炮-J国重巡', orderType: 'power' },
  6: { type: '侦察机', orderType: 'tracking' },
  7: { type: '修理员', orderType: 'dexIndex' },
  8: { type: '副炮', orderType: 'power' },
  9: { type: '反潜设备', orderType: 'antiSubmarine' },
  10: { type: '反舰导弹', orderType: 'power' },
  11: { type: '反舰导弹发射器', orderType: 'dexIndex' },
  12: { type: '强化部件', orderType: 'dexIndex' },
  13: { type: '强化部件-大', orderType: 'dexIndex' },
  14: { type: '强化部件-中', orderType: 'dexIndex' },
  15: { type: '强化部件-小', orderType: 'dexIndex' },
  16: { type: '强化部件-潜艇', orderType: 'dexIndex' },
  17: { type: '强化部件-航母类', orderType: 'dexIndex' },
  18: { type: '强化部件-航空类', orderType: 'dexIndex' },
  19: { type: '战斗机', orderType: 'antiAircraft' },
  20: { type: '战斗机-水上战斗机', orderType: 'antiAircraft' },
  21: { type: '炮弹', orderType: 'dexIndex' },
  22: { type: '炮弹-战列类', orderType: 'dexIndex' },
  23: { type: '炮弹-重巡类+', orderType: 'dexIndex' },
  24: { type: '轰炸机', orderType: 'bomber' },
  25: { type: '轰炸机-水上轰炸机', orderType: 'bomber' },
  26: { type: '防空导弹', orderType: 'antiAircraft' },
  27: { type: '防空导弹-大型', orderType: 'antiAircraft' },
  28: { type: '防空导弹发射器', orderType: 'dexIndex' },
  29: { type: '防空导弹发射器-大型', orderType: 'dexIndex' },
  30: { type: '防空炮', orderType: 'antiAircraft' },
  31: { type: '雷达', orderType: 'tracking' },
  32: { type: '雷达-战列类', orderType: 'tracking' },
  33: { type: '雷达-声呐', orderType: 'antiSubmarine' },
  34: { type: '鱼雷', orderType: 'torpedo' },
  35: { type: '鱼雷-潜艇限定', orderType: 'torpedo' },
  36: { type: '鱼雷机', orderType: 'torpedo' },
  37: { type: '鱼雷机-航母类', orderType: 'torpedo' },
}

const EQUIPMENT_SPECIAL_EFFECT_KEY_MAPPING = {
  39: '经验',
  40: '仅限',
}

const ZJSNR_CANNONRY_ORDER_KEY_VALUE_PAIRING = {
  0: '超长',
  1: '长',
  2: '短',
  3: '无',
}

const CQHY_PERSONAL_SCRIPT_TYPE_MAPPING = [
  {
    jp: '秘書艦（小）',
    cn: '秘书舰（小）',
  },
  {
    jp: '秘書艦（大）',
    cn: '秘书舰（大）',
  },
  {
    jp: '戦闘',
    cn: '战斗台词',
  },
  {
    jp: '看板娘',
    cn: '看板娘',
  },
  {
    jp: 'その他',
    cn: '其他',
  },
]

const CQHY_PERSONAL_SCRIPT_SITUATION_MAPPING = [
  {
    jp: '天気',
    cn: '天气',
  },
  {
    jp: '時間',
    cn: '时间',
  },
  {
    jp: 'ログイン後',
    cn: '玩家登录',
  },
  {
    jp: '通用',
    cn: '通用',
  },
  {
    jp: 'シナリオ',
    cn: '剧情',
  },
  {
    jp: '親密度',
    cn: '好感度',
  },
  {
    jp: 'クリック',
    cn: '触摸',
  },
  {
    jp: 'ワールドマップ',
    cn: '世界地图',
  },
  {
    jp: '作戦マップ展開',
    cn: '战术地图展开',
  },
  {
    jp: '進撃',
    cn: '前进',
  },
  {
    jp: '撤退',
    cn: '撤退',
  },
  {
    jp: 'お知らせ',
    cn: '通知',
  },
  {
    jp: 'ミッション',
    cn: '任务',
  },
  {
    jp: 'メール',
    cn: '邮件',
  },
  {
    jp: '設定',
    cn: '设定',
  },
  {
    jp: 'スキル',
    cn: '技能',
  },
  {
    jp: '入手',
    cn: '获得',
  },
  {
    jp: '結婚',
    cn: '结婚',
  },
  {
    jp: 'ローディング',
    cn: '载入中',
  },
  {
    jp: '遠征',
    cn: '远征',
  },
  {
    jp: 'ショップ',
    cn: '商店',
  },
  {
    jp: '整備',
    cn: '整备',
  },
  {
    jp: '研究',
    cn: '研究',
  },
  {
    jp: 'フレンド',
    cn: '好友',
  },
  {
    jp: '母艦',
    cn: '母舰',
  },
  {
    jp: '自室',
    cn: '提督室',
  },
  {
    jp: '祝日',
    cn: '节假日',
  },
  {
    jp: '戦闘開始',
    cn: '战斗开始',
  },
  {
    jp: '選択',
    cn: '选择',
  },
  {
    jp: '移動',
    cn: '移动',
  },
  {
    jp: '敵艦撃沈',
    cn: '击沉敌舰',
  },
  {
    jp: '自分轟沈',
    cn: '自身沉没',
  },
  {
    jp: '母艦攻撃される',
    cn: '母舰受到攻击',
  },
  {
    jp: '戦闘結果S',
    cn: '战斗结果S',
  },
  {
    jp: '戦闘結果A',
    cn: '战斗结果A',
  },
  {
    jp: '戦闘結果B',
    cn: '战斗结果B',
  },
  {
    jp: 'シナリオ・好感度',
    cn: '剧情&好感度',
  },
  {
    jp: '祝日・親密度',
    cn: '节假日&好感度',
  },
  {
    jp: 'ログイン後・親密度',
    cn: '登录&好感度',
  },
]

module.exports = {
  CONFIG,
  ZJSNR_ROOT_PATH,
  STRATEGY_ROOT_PATH,
  ZJNSR_SHIP_PARAMETER_MAPPING,
  ZJSNR_EQUIPMENT_PARAMETER_MAPPING,
  ZJSNR_EQUIPMENT_TYPE_ORDER_KEY_MAPPING,
  ZJSNR_SHIP_NATIONALITY,
  ZJSNR_SHIP_TYPES,
  ZJSNR_SHIP_DIMENSIONS,
  EQUIPMENT_TYPE_MAPPING,
  ZJSNR_SHIP_ORDERS,
  EQUIPMENT_SPECIAL_EFFECT_KEY_MAPPING,
  ZJSNR_CANNONRY_ORDER_KEY_VALUE_PAIRING,
  ZJSNR_ENEMY_PARAMETER_MAPPING,
  SEPARATE_MARK,
  SECONDARY_SEPARATE_MARK,
  CQHY_ROOT_PATH,
  CQHY_PERSONAL_SCRIPT_TYPE_MAPPING,
  CQHY_PERSONAL_SCRIPT_SITUATION_MAPPING,
  ZJSNR_SHIP_COSTS,
}
