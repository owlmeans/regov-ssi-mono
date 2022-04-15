
import 'dotenv/config'
import http from 'http'
import { startWSServer } from '../server'


const httpServer = http.createServer((_, response) => {
  response.writeHead(404)
  response.end()
})

startWSServer(httpServer, {
  timeout: parseInt(process.env.RECEIVE_MESSAGE_TIMEOUT || '30'),
  did: {
    prefix: process.env.DID_PREFIX,
    baseSchemaUrl: process.env.DID_SCHEMA,
    schemaPath: process.env.DID_SCHEMA_PATH,
  }
})

const port = process.env.SERVER_WS_PORT || '8080'
httpServer.listen(parseInt(port), () => {
  console.log('Server is listening on port: ' + port)
})

