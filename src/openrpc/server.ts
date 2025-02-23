/**
 * Implements oRPC "contract" methods for a server that complies with the 
 * OpenRPC and JSON-RPC specs. Also builds a schema doc usable by an 
 * OpenRPC client.
 */
import { oc } from '@orpc/contract';
import { JSONRPCNotification, JSONRPCRequest, JSONRPCResponse } from './jsonrpc'
import { zodToJsonSchema } from '@orpc/zod';
import { z } from 'zod';
import type { OpenRPCObj, OpenRPCInfoObj, OpenRPCServerObj } from './schema';
import type { OpenRPCExternalDoc, MethodPermissionedRole } from './schema';
            
export {
  OpenRPCServer
}

class OpenRPCServer {
  _info: OpenRPCInfoObj ;
  _server: OpenRPCServerObj;
  _methods: { [key: string]: any } = {};
  static _instance: OpenRPCServer | null = null;

  constructor(server: OpenRPCServerObj, info?: OpenRPCInfoObj) {
    this._server = server;
    this._info = info || {
      version: '0.1.1',
      title: 'OpenRPC contract using [oRPC](https://orpc.unnoq.com/)'
    }
  }

  /**
   * Creates an OpenRPC server instance.
   * @param server - the server base url and name
   * @param info? - the optional service info
   * @returns 
   */
  static create(c: { 
    server: OpenRPCServerObj, 
    info?: OpenRPCInfoObj
  }): OpenRPCServer {
    OpenRPCServer._instance = new OpenRPCServer(c.server, c.info);
    return OpenRPCServer._instance;
  }

  /**
   * Returns the active OpenRPCServer (Singleton) instance 
   * @param server 
   * @param info 
   * @returns 
   */
  static instance(): OpenRPCServer {
    if (! OpenRPCServer._instance) throw(Error(
      `No OpenRPCServer instance available.`
      +` First create an instance using OpenRPCServer.create(...)`
    ))
    return OpenRPCServer._instance;
  }

  /**
   * Service Discovery Method
   * JSON-RPC APIs can support the OpenRPC specification by implementing a 
   * service discovery method that will return the OpenRPC schema for the 
   * JSON-RPC API. The method MUST be named rpc.discover. The rpc. prefix is a 
   * reserved method prefix for JSON-RPC 2.0 specification system extensions. 
   * @returns - the OpenRPC contract for discovering this RPC schema
   */
  discover() {
    return oc
      .route({ method: 'GET', path: `/rpc.discover` })
      .input(JSONRPCRequest('rpc.discover', {}))
      .output(JSONRPCResponse(z.object({ 
        name: z.string(),
        schema: z.any() 
      })));
  }

  /**
   * Builds an oRPC contract for a JSON-RPC 'Request' method
   * See: https://www.jsonrpc.org/specification [4 Request object]
   * @param method - the method name 
   * @param schema.params - a Zod schema for the JSON-RPC 'params' obj
   * @param schema.result - a Zod schema for the JSON-RPC 'result' obj
   * @param schema.permissions - an array of MethodPermissionedRole
   * @returns - the oRPC contract (needs implementation by oRPC server)
   */
  request(method: string, schema: { 
    params: z.ZodTypeAny, 
    result: z.ZodTypeAny, 
    permissions?: MethodPermissionedRole[],
    description?: string,
    summary?: string,
    externalDocs?: OpenRPCExternalDoc[]
    }) {
    this._methods[method] = {
      //method: z.literal(method),
      params: schema.params,
      result: schema.result,
      permissions: schema.permissions || ['anyone']
    }
    return oc
      .route({ method: 'POST', path: `/${method}` })
      .input(JSONRPCRequest(method, schema.params))
      .output(JSONRPCResponse(schema.result));
  }

  /**
   * Builds an oRPC contract for a JSON-RPC 'Notification' method
   * See: https://www.jsonrpc.org/specification [4.1 Notification]
   * @param method - the method name 
   * @param schema.params - a Zod schema for the JSON-RPC 'params' obj
   * @param schema.permissions - an array of MethodPermissionedRole
   * @returns - the oRPC contract (needs implementation by oRPC server)
   */
  notification(method: string, schema: { 
    params: z.ZodTypeAny, 
    permissions?: any,
    description?: string,
    summary?: string,
    externalDocs?: OpenRPCExternalDoc[]
  }) {
    this._methods[method] = {
      //method: z.literal(method),
      params: schema.params,
      permissions: schema.permissions
    }
    return oc
      .route({ method: 'POST', path: `/${method}` })
      .input(JSONRPCNotification(method, schema.params))
  }

  /**
   * Builds the OpenRPC schema doc, based on the 'request' and 'notification'
   * methods added to this OpenRPC server.
   * @returns - a JSON doc complaint with the OpenRPC spec
   */
  schema(): any {
    const schema: OpenRPCObj = { 
      openrpc: "1.3.2", // https://spec.open-rpc.org/
      info: this._info,
      servers: [ this._server ], // we only implement one server
      methods: [] 
    } ;  

    for (let key in this._methods) {
      let method = this._methods[key];
      const paramsSchema = method.params;
      const resultSchema = method.result;
      const permissions = method.permissions;
      schema.methods.push({
        // minimal needed attibutes
        name: key,
        paramsStructure: 'by-name',
        params: method.params
          ? zodToJsonSchema(method.params)
          : { type: "null" },
        // for Notifications we have no 'result' response
        result: method.result 
          ? zodToJsonSchema(method.result) 
          : { type: "null" },
        // we use 'tags' for assigning required permissions
        tags: permissions 
          ? permissions.map((t: string) => { name: t })
          : [],
        // optional attributes
        description: method.description || '',
        summary: method.summary || 'No summary',
        externalDocs: method.externalDocs || []
      });
    }
    console.log("OpenRPC JSONSchema = ", schema);
    return schema;
  }
}
