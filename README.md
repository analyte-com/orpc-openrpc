# An OpenRPC implementation over oRPC

This is a simple implementation of an [OpenRPC](https://open-rpc.org/) 
client and server using the [oRPC API builder](https://orpc.unnoq.com/).

**OpenRPC server features**

- Use oRPC 'contracts' to define API methods.
- The API methods are (mostly) compliant with the OpenRPC and JSON-RPC specs.
- The API methods inputs and output schemas can be defined using Zod.
- Both 'request' and 'notification' methods can be defined.
- Automatically creates the OpenRPC schema document.
- Implements the 'rpc.discover' method to be used by client.
- Can define authorization roles for each method (non existent in OpenRPC).

**OpenRPC client features**

- Uses the 'discovery' url provided by server to reconstruct the schema.
- Creates a client based on the discovered schema.
- Exposes in a typesafe and friendly way all the schema methods.
- The client auto validates inputs and outputs using the schema.

**TODO**

- Currently, the 'params' and 'result' schema do not strictly follow the OpenRPC
  spec. We are using the 'zodToJsonSchema' generated schema, which is not very
  different but is not compliant.  

**References**

- [oRPC- Typesafe API's Made Simple](https://orpc.unnoq.com/)
- [OpenRPC Specification](https://spec.open-rpc.org/)
- [JSON-RPC Specification](https://www.jsonrpc.org/specification)

**Disclaimer**

This is experimental work in progress to be used for road testing oRPC and 
as a simple proof of concept, so **IT IS NOT SUITABLE FOR PRODUCTION USE**.

**Credits**

**BIG THANKS** to the [UNNOQ team](https://github.com/unnoq/orpc) for 
their excellent work and for sharing it. 

Join their [Discord channels](https://discord.com/invite/TXEbwRBvQn) for help.

## Install and run

To **install dependencies**:

```bash
bun install
```

To **run the OpenRPC server**:
```bash
bun run index.ts
```

To **run the OpenRPC client**:
```bash
bun run client.ts
```

This project was created using `bun init` in bun v1.1.42. 
[Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
