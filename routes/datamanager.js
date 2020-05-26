const express = require('express')
const router = express.Router()
const dmService = require('../services/datamanagerservices')

/**
 * 更新战舰少女R舰娘数据
 */
router.post('/zjsnr/ships/info', function (req, res, next) {
    dmService.insertZJSNRShipInformationService(() => {
        res.send('船只数据录入成功')
    })
})

/**
 * 更新战舰少女R装备数据
 */
router.post('/zjsnr/equipments/info', function (req, res, next) {
    dmService.insertZJSNREquipmentInformationService(() => {
        res.send('装备数据录入成功')
    })
})

router.post('/zjsnr/equipments/shiptype', (req, res, next) => {
    dmService.parseZJSNREquipmentShipType(response => {
        res.send(response)
    })
})

router.post('/zjsnr/offlinedata', (req, res, next) => {
    dmService.parseZJSNROfflineData(response => {
        res.send(response)
    })
})

router.post('/zjsnr/cannonry', (req, res, next) => {
    dmService.enteringCannonryOrderingData(response => {
        res.send('炮序数据录入成功')
    })
})

router.post('/zjsnr/shipnamemap/create', (req, res, next) => {
    dmService.createShipNameMapping(() => {
        res.send('CID与名称对应表生成完成')
    })
})

router.post('/zjsnr/enemy/info', (req, res, next) => {
    dmService.insertZJSNREnemyInformationService(result => {
        res.send('敌人数据录入完成')
    })
})

router.post('/cqhy/scripts', (req, res, next) => {
    dmService.insertCQHYScripts(result => {
        res.send(result)
    })
})

module.exports = router