import { oc, type InferContractRouterInputs, type InferContractRouterOutputs } from '@orpc/contract';
import { z } from 'zod';
import { OpenRPCServer } from './openrpc';

const openRPC = OpenRPCServer.create({
  info: { version: "1.0.1", title: "Qualify Services RPC" },
  server: { url: "http://localhost:3000", description: "" },
});

export const contract = oc.router({
  discover: openRPC.discover(),

  getUser: openRPC.request('get_user', {
    params: z.object({ 
      id: z.string().describe('The user id') 
    }),
    result: z.object({ 
      name: z.string(), 
      avatar: z.string() 
    }),
    permissions: ['admin', 'self']
  }),

  notify: openRPC.notification('notify', {
    params: z.object({ 
      from: z.string(),
      to: z.string(),
      message: z.string(),
      obj: z.optional(z.any()) 
    }),
    permissions: ['authenticated']
  }),
})

export type Inputs = InferContractRouterInputs<typeof contract>
export type Outputs = InferContractRouterOutputs<typeof contract>
