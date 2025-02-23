import { implement, ORPCError } from '@orpc/server'
import { contract } from './contract'
import { OpenRPCServer } from './openrpc/server';

// Ensure every implement must be match contract
export const pub = implement(contract);

export const authed = pub
  .use(({ context, path, next }, input) => {
    /** put auth logic here */
    return next({})
  })
 
export const router = pub.router({
  discover: pub.discover.handler(({ input, context }) => {
    console.log("request discover");
    let openRpc =  OpenRPCServer.instance();
    const result = { 
      name: openRpc._info.title || 'OpenRPC Schema',
      schema: openRpc.schema()
    };
    console.log("request result =", result);
    return {
      jsonrpc: '2.0',
      id: input.id,
      result: { ...result }
    };
  }),

  getUser: pub.getUser.handler(({ input, context }) => {
    console.log("request input =", input);
    const result = {
        name: 'mario'+input.params.id,
        avatar: 'avatar',
    };
    console.log("request result =", result);
    return {
      jsonrpc: '2.0',
      id: input.id,
      result: { ...result }
    };
  }),

  notify: pub.notify.handler(({ input, context }) => {
    console.log("notification input =", input);
    console.log("notification does NOT emit response");
    return ; // NO RESPONSE issued
  })
})
