import { HTTP_Methods, Logger } from "@yamato-daiwa/es-extensions";
import { Server, Request, Response } from "../../Source";
import ConsoleApplicationLogger from "../../Source/UtilsIncubator/ConsoleApplicationLogger";


/* [ Execution ] cd  nodemon Tests/MinimalExample.test.ts */
(function runApplication(): void {

  Logger.setImplementation(ConsoleApplicationLogger);

  Server.initializeAndStart({
    IP_Address: "127.0.0.1",
    HTTP: { port: 1337 },
    routing: [
      {
        route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
        async handler(_request: Request, response: Response): Promise<void> {
          return response.submitWithSuccess({
            HTML_Content: "<h1>MinimalExample</h1>"
          });
        }
      }
    ]
  });

})();
