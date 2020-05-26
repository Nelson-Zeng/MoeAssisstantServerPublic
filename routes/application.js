const express = require('express')
const router = express.Router()
const applicationService = require('../services/applicationservices')

router.get('/version', (req, res) => {
    applicationService.getLatestVersion(result => {
        res.send(result)
    })
})

module.exports = router
