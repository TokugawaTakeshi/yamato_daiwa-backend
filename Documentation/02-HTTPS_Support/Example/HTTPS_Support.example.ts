import { HTTP_Methods, HTTP_StatusCodes } from "@yamato-daiwa/es-extensions";
import { Server, Request, Response } from "@yamato-daiwa/backend";
import Path from "path";


/* Running the test:
*  npx nodemon 02-HTTPS_Support/Example/HTTPS_Support.example.ts
* */
Server.initializeAndStart({
  host: "127.0.0.1",
  HTTP: { port: 1337 },
  HTTPS: {
    port: 1338,
    SSL_CertificateFileAbsolutePath: Path.resolve(__dirname, "./SSL/cert.pem"),
    SSL_KeyFileAbsolutePath: Path.resolve(__dirname, "./SSL/key.pem")
  },
  routing: [
    {
      route: { type: HTTP_Methods.get, pathTemplate: "/" },
      async handler(request: Request, response: Response): Promise<void> {
        console.log(request);
        return response.submit({
          statusCode: HTTP_StatusCodes.OK,
          HTML_Content: "<h1>Hello, world!</h1>"
        });
      }
    }
  ]
});
