/**
 * Types and helpers methods implementing the OpenRPC Specification
 * See: https://spec.open-rpc.org
 */
export {
  type OpenRPCObj,
  type OpenRPCInfoObj,
  type OpenRPCServerObj,
  type OpenRPCTagObj,
  type OpenRPCMethodObj,
  type OpenRPCExternalDoc,
  type MethodPermissionedRole,
  type MethodPermissionsObj
}

type OpenRPCInfoObj = {
  version: string,
  title: string
}

type OpenRPCServerObj = {
  url: string,
  name?: string,
  description?: string
}

type OpenRPCExternalDoc = {
  url: string;
  description: string;
}

type OpenRPCTagObj = {
  name: string;
  description?: string;
  summary?: string;
  externalDocs?: OpenRPCExternalDoc[];  
}

type OpenRPCMethodObj = { 
  name: string;
  paramsStructure: 'by-name';
  params: any;
  result?: any;
  description?: string;
  tags?: OpenRPCTagObj[]; // we use them for permissions !
  summary?: string;
  externalDocs?: OpenRPCExternalDoc[];  
  // NOT implemented
  // deprecated, servers, errors, links, examples
}

// the root object of the OpenRPC document. 
type OpenRPCObj = {
  openrpc: string;
  info: OpenRPCInfoObj;
  servers: OpenRPCServerObj[];
  methods: OpenRPCMethodObj[];
  components?: any[]; // NOT implemented
  externalDocs?: any[]; // NOT impĺemented
}

/**
 * The MethodPermissionsObj (based on TagObj) is an array of the roles (as 
 * defined by MethodPermissionedRole) that are allowed to execute the method.
 * Any of the roles included in the array is allowed to do so.
*/
type MethodPermissionsObj = OpenRPCTagObj[];

/**
  These are "permissioned" roles that are allowed to call/execute the 
  method.

  Some common permissioned roles may be:

  - 'anyone'           // anyone can call the method
  - 'authenticated'    // any authenticated users can call the method
  - 'admin'            // only Admins can call the method
  - 'self'             // only the same user (self) can call the method

  Other roles types can be added as neeeded, such as:

  - 'lab-operator' 
  - 'department-X-operator'
  - 'lab-manager' 
  - ...etc
*/    
type MethodPermissionedRole = string;
