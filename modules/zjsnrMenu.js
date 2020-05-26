class zjsnrMenuInfo {
    constructor(params) {
        for(let key in params) {
            this[key] = params[key]
        }
    }
}

module.exports = zjsnrMenuInfo