require('dotenv').config();
const { Pool } = require('pg')
 
// const connectionConfig = {
//   user: process.env.PSQL_HEROKU_USERNAME,
//   // host: 'localhost',
//   // host: `/cloudsql/${process.env.PSQL_INSTANCE_CONNECTION_NAME}`,
//   host: process.env.PSQL_HEROKU_INSTANCE_CONNECTION_NAME,
//   port: process.env.PSQL_HEROKU_PORT,
//   password: process.env.PSQL_HEROKU_PASSWORD,
//   database: process.env.PSQL_HEROKU_DATABASE
// };

const connectionConfig = {
  connectionString: 'postgres://rapqbqahxaswrn:2e38b6814f132cd2f3759083ad3562bee686d7397a900d69f86ee352edd57ddb@ec2-34-194-158-176.compute-1.amazonaws.com:5432/d3n23rch2pqkre',
  ssl: {
    rejectUnauthorized: false
  }
}

const pool = new Pool(connectionConfig)

module.exports = {
  async query(text, params) {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('executed query', { text, duration, rows: res.rowCount })
    return res
  },
  async getClient() {
    const client = await pool.connect()
    const query = client.query
    const release = client.release
    // set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!')
      console.error(`The last executed query on this client was: ${client.lastQuery}`)
    }, 5000)
    // monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args
      return query.apply(client, args)
    }
    client.release = () => {
      // clear our timeout
      clearTimeout(timeout)
      // set the methods back to their old un-monkey-patched version
      client.query = query
      client.release = release
      return release.apply(client)
    }
    return client
  }
}