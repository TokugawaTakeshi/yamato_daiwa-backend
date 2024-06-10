import { ProtocolDependentDefaultPorts, Server } from "@yamato-daiwa/backend";
import ProductController from "./Controllers/ProductController";


/* Running the test:
*  ts-node EntryPoint.ts
* */
Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  publicDirectoriesAbsoluteOrRelativePaths: [ "public" ],
  routing: [ ProductController ]
});
