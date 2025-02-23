import { RPCHandler,  } from '@orpc/server/node';
import { OpenAPIHandler } from '@orpc/openapi/node';
import { ZodAutoCoercePlugin } from '@orpc/zod';
import { createServer } from 'node:http';
import { router } from './src/server';

// this works like a standard HTTP OpenAPI
// we can use use cURL or Postman for testing as usual 
// is listening in the /api endpoint
const openAPIHandler = new OpenAPIHandler(router, {
  plugins: [
    new ZodAutoCoercePlugin(),
  ],
})
 
// this is NOT a standard HTTP API (or JSON-RPC API either)
// we can NO use cURL or Postman for testing this
// serializes in a different way so the "client" only works with this
// is listening in the /orpc endpoint
const rpcHandler = new RPCHandler(router);

const server = createServer(async (req, res) => {
  // check for standard OpenAPI endpoint: /api
  if (req.url?.startsWith('/api')) {
    const { matched } = await openAPIHandler.handle(req, res, {
      prefix: '/api',
      context: {},
    })
 
    if(matched){
      return 
    }
  }
 
  // check for "custom" RPC endpoint: /orpc
  if(req.url?.startsWith('/orpc')){
    const { matched } = await rpcHandler.handle(req, res, {
      prefix: '/orpc',
      context: {},
    })
 
    if(matched){
      return 
    }
  }

  res.statusCode = 404
  res.end('Not found')
})
 
server.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is available at http://localhost:3000')
})
