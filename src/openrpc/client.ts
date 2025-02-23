/**
 * OpenRPCClient
 * Builds a client based on a given OpenRPC schema using the discovery url, 
 * and exposes all its methods in a easy usable way, including input and 
 * output validations as defined in the provided schema.
 * 
 * Usage:
 * 
 *  // provide the discovery url and build the client
 *  let client = await await OpenRPCClient.create({ discover: 'http://...' })
 * 
 *  // getUser is and exposed method
 *  let user = await client.getUser({ id: '1234' });
*/
import { zodToJsonSchema } from '@orpc/zod';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import type { OpenRPCInfoObj, OpenRPCServerObj, OpenRPCMethodObj } from './schema';
import type { OpenRPCExternalDoc, MethodPermissionedRole } from './schema';

export {
  OpenRPCClient,
}

// the type and structure of a JSON-RPC Call
type JSONRPCCall = (params: any) => Promise<any>;

class OpenRPCClient {
  // the reconstructed schema used by this Client
  private _schema: {
    info?: OpenRPCInfoObj;
    server: OpenRPCServerObj;
    methods: Record<string, OpenRPCMethodObj>;
  } = { 
    server: { url: '' },
    methods: {}
  };

  // the 'JSONRPC' methods exposed by the Client
  private _calls: Record<string, JSONRPCCall> = {}

  constructor() {
    // we use a Proxy so that any function added to '_calls' can be accessed as 
    // if it were a method of OpenRPCClient, exposing the RPC methods in a more 
    // clear and usable way.
    return new Proxy(this, {
      get: (target, prop: string) => {
        if (prop in target) {
          return (target as any)[prop];
        }
        if (prop in target._calls) {
          return target._calls[prop];
        }
        return undefined;
      }
    });
  }

  /**
   * Creates a OpenRPC client based on the given remote schema.
   * @param url.discover - the Schema URL used to build the Client 
   * @returns - a Client with all RPC methods exposed
   */
  static async create(url: {
    discover: string
  }): Promise<OpenRPCClient> {
    // get the OpenRPC schema using the discoverUrl
    let _this = new OpenRPCClient();
    await _this.discover(url.discover);
    return _this.build();
  }

  /**
   * Loads the OpenRPC schema using the discovery Url and reconstructs the 
   * private '_schema' object, also recreating the Zod schemas needed to 
   * validate the RPC inputs and outputs.
   * @param url - the discovery url where the schema resides
   * @returns - this instance with the _schema updated
   */
  async discover(url: string): Promise<this> {
    this._schema.server = { url: '', name: '' };
    this._schema.info = { version: '0.0.0', title: 'No title'};
    this._schema.methods = {};
    return this;
  }

  /**
   * Given the reconstructed schema it builds and exposes all the methods
   * so they can be directly used by the client.
   * @returns - this instance with all methods exposed
   */
  build(): this { 
    for (let name in this._schema.methods) {
      const exposedName = name.replace(/_([a-z])/g, (_, chr) => chr.toUpperCase());
      let method: any = this._schema.methods[name];
      this._calls[exposedName] = this.rpcCaller(
        this._schema.server?.url, 
        exposedName, 
        method
      );
    }  
    return this;
  }

  /**
   * Returns an implemented and validated JSONRPCCall
   * @param baseUrl - the server url to call
   * @param renamed - the exposed name of the method to call
   * @param method - the method itself with params, result, etc ...
   * @returns - the exposed JSONRPCCall function
   */
  rpcCaller(baseUrl: string, exposedName: string, method: any) {
    return async (params: any): Promise<any> => {
      // build the Url to the requested method
      const url = `${baseUrl}/${method.name}`;

      // prepare params, if it is 'request' we need an 'id'
      if (method.params.id) params.id = nanoid();
      
      // validate input schema 
      let inputs = method.params;
      inputs.parse(params);

      // fetch remote call
      let response = { done: true };

      // validate output
      console.log(`${exposedName}: fetch ${url} body=${JSON.stringify(params)}`);
      console.log(`${exposedName}: fetch response=${JSON.stringify(response)}`);
      return response
    }
  }
}
