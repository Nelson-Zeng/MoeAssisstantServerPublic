const connection = require("../lib/mySqlConnection")

const mistScripts = require('../modules/cqhyScripts')

const queryShipScript = (id) => {
    return new Promise((resolve, reject) => {
        const personalScriptPromise = connection.queryResult('the_mirage_of_steelblue_personal_script', [{column: 'dexIndex', value: id}])

        const reactionScriptPromise = connection.select(`SELECT * FROM the_mirage_of_steelblue_reaction_script WHERE speaker = ${id} OR listener = ${id}`)
    
        const finalPromise = Promise.all([personalScriptPromise, reactionScriptPromise])
    
        finalPromise.then(results => {
            resolve(new mistScripts(...Array.from(results)))
        })
    })
}

module.exports = {
  queryShipScript,
}
