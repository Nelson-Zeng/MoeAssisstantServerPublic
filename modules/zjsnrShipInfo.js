class zjsnrShipInfo {
    constructor(params) {
        for(let key in params) {
            this[key] = params[key]
        }
    }
}

module.exports = zjsnrShipInfo