import { z } from 'zod';

export {
  JSONRPCNotification, 
  JSONRPCRequest,
  JSONRPCResponse
}

const JSONRPCRequest = (method: string, params: any) => z.object({
  jsonrpc: z.literal('2.0'),
  method: z.literal(method),
  id: z.string().nanoid(),
  params: z.optional(params)
})

const JSONRPCNotification = (method: string, params: any) => z.object({
  jsonrpc: z.literal('2.0'),
  method: z.string(),
  params: z.optional(params)
  // id: z.string(), NO message id for notifications
})

const JSONRPCResponse = (result: any) => z.object({
  jsonrpc: z.literal('2.0'),
  id: z.string().nanoid(),
  result: z.optional(result),
  error: z.optional(z.object({
    code: z.number(),
    message: z.string(),
    data: z.any()
  }))
})
