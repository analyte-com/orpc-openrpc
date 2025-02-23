import { createORPCClient, ORPCError } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { RouterClient } from '@orpc/server';
import type { ContractRouterClient } from '@orpc/contract';
import type { router } from './src/server';
import { contract } from './src/contract';
 
const rpcLink = new RPCLink({
  // NOTE that we need to use the 'orpc' endpoint in the client
  // the client can not work with the 'api' endpoint
  url: 'http://localhost:3000/orpc',
  // fetch: optional override for the default fetch function
  // headers: provide additional headers
})
 
// const client: RouterClient<typeof router> = createORPCClient(rpcLink)
const client: ContractRouterClient<typeof contract> = createORPCClient(rpcLink);

console.log("client", client["getUser"]);

try {
  const output = await client.getUser({
    "jsonrpc": "2.0",
    "method": "get_user",
    "id": "124443",
    "params": {
      "id": "1234", "otro": 1234
    }
  });
  console.log("\nreceived output", output);
}
catch (error) {
  console.log(error);
}
