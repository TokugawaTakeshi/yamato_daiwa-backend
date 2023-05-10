import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";
// import Path from "path";


/* Running the test:
*  ts-node EntryPoint.ts
* */
Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  HTTPS: {
    port: ProtocolDependentDefaultPorts.HTTPS,
    // SSL_CertificateFileRelativeOrAbsolutePath: Path.resolve(__dirname, "./SSL/SSL_Certificate.pem"),
    // SSL_KeyFileRelativeOrAbsolutePath: Path.resolve(__dirname, "./SSL/SSL_Key.pem"),
    SSL_CertificateFileRelativeOrAbsolutePath: "SSL/SSL_Certificate.pem",
    SSL_KeyFileRelativeOrAbsolutePath: "SSL/SSL_Key.pem"
  },
  routing: [
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({ HTML_Content: "<h1>Hello, world!</h1>" });
      }
    }
  ]
});
