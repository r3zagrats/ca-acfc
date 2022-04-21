const superagent = require('superagent')

;(async() => {
  const result = await superagent.get('/pgdb/zalooa')
  console.log(result)
})()