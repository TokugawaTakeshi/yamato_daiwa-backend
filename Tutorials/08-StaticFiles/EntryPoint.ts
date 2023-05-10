import { ProtocolDependentDefaultPorts, Request, Response, Server } from "@yamato-daiwa/backend";
import { HTTP_Methods, ClientErrorsHTTP_StatusCodes } from "@yamato-daiwa/es-extensions";
import Path from "path";


/* Running the test:
*  ts-node EntryPoint.ts
* */
Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  publicDirectoriesAbsoluteOrRelativePaths: [ "public" ],
  routing: [
    {
      route: {
        HTTP_Method: HTTP_Methods.get,
        pathTemplate: "restricted_file"
      },
      handler(request: Request, response: Response): Promise<void> {

        const secret: string | null = request.URI.searchParams.get("secret");

        if (secret !== "ALPHA") {
          return response.submitWithError({ statusCode: ClientErrorsHTTP_StatusCodes.notFound })
        }


        return response.submitWithSuccess({ filePath: Path.join(__dirname, "SecretFile.png") })

      }
    }
  ]
});
