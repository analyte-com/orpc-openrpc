import {
  OpenAPIGenerator
} from '@orpc/openapi'
import {
  ZodToJsonSchemaConverter
} from '@orpc/zod'
import {
  router
} from './src/server'
import {
  contract
} from './src/contract'

const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [
    new ZodToJsonSchemaConverter(),
  ],
})

const spec = await openAPIGenerator.generate(contract /* or router */ , {
  info: {
    title: 'oRPC API Demo',
    version: '0.0.1',
  },
})

console.log(JSON.stringify(spec, null, 2))
