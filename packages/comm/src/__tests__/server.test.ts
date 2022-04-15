
import 'dotenv/config'
import { createWSClient } from '../client'

describe('WS Server', () => {
  it('receives', async () => {
    const client1 = await createWSClient({
      timeout: parseInt(process.env.RECEIVE_MESSAGE_TIMEOUT || '30'),
      server: process.env.CLIENT_WS as string
    })
    const client2 = await createWSClient({
      timeout: parseInt(process.env.RECEIVE_MESSAGE_TIMEOUT || '30'),
      server: process.env.CLIENT_WS as string
    })

    await client1.send('did:' + process.env.DID_PREFIX + ':zzz')
    await client2.send('did:' + process.env.DID_PREFIX + ':yyy')
    await client1.close()
    await client2.close()
  })
})