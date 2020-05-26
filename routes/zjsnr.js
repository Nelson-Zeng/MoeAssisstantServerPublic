const express = require('express')
const router = express.Router()

const zjsnrService = require('../services/zjsnrservices')

router.get('/ships/info', function(req, res, next) {
  zjsnrService.queryShipsInfo(req.query, result => {
    res.send(result)
  })
})

router.get('/equipments/info', function(req, res, next) {
  zjsnrService.queryEquipmentsInfo(req.query, result => {
    res.send(result)
  })
})

router.get('/ships/illustrations/:id', function(req, res, next) {
  const id = req.params.id
  if (new RegExp(/^\d{1,4}$/).test(id)) {
    zjsnrService.queryShipsIllustrations(id, result => {
      res.send(result)
    })
  } else {
    res.status(404).send('舰娘ID不正确')
  }
})

router.get('/ships/acquireRoute/:cid', function(req, res, next) {
  const cid = Number(req.params.cid)

  zjsnrService.queryAcquireRoute(cid, result => {
    res.send(result)
  })
})

router.get('/ships/:id/related', function(req, res, next) {
  const id = Number(req.params.id)

  zjsnrService.queryRelatedShipInfo(id, result => {
    res.send(result)
  })
})

router.get('/gameutil/formula/:type', function(req, res, next) {
  const type = req.params.type

  zjsnrService.fetchFormula(type, result => {
    res.send(result)
  })
})

router.get('/gameutil/expeditions', (req, res, next) => {
  zjsnrService.queryExpeditions(result => {
    res.send(result)
  })
})

router.get('/gameutil/cannonryorder', (req, res, next) => {
  zjsnrService.queryCannonryOrder(req.query, result => {
    res.send(result)
  })
})

router.get('/gameutil/buildtime/:id', (req, res, next) => {
  const type = req.params.id
  zjsnrService.queryBuildTime(type, result => {
    res.send(result)
  })
})

router.get('/gameutil/seachart/drop', (req, res, next) => {
  zjsnrService.queryDropInfo(req.query, result => {
    res.send(result)
  })
})

router.get('/gameutil/seachart/info', (req, res, next) => {
  zjsnrService.querySeaChartInfo(result => {
    res.send(result)
  })
})

router.get('/ships/:id/info', function(req, res, next) {
  zjsnrService.queryShipInfo(req.params.id, result => {
    res.send(result)
  })
})

router.get('/academy', function(req, res, next) {
  zjsnrService.queryAcademyInfo(result => {
    res.send(result)
  })
})

router.get('/menu', function(req, res, next) {
  zjsnrService.queryMenuInfo(result => {
    res.send(result)
  })
})

router.post('/ships/customization/evaluation', (req, res, next) => {
  zjsnrService.setCustomEvaluation(req.body, result => {
    res.send(result)
  })
})

module.exports = router
