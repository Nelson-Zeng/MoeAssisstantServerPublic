const express = require("express")
const router = express.Router()
const mistService = require("../services/cqhyservices")

router.get("/script/:id", function (req, res, next) {
  const id = req.params.id
  mistService.queryShipScript(id, (result) => {
    res.send(result)
  })
})

module.exports = router
