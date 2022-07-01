import { Server, ProtocolDependentDefaultPorts } from "../../../../Source";
import type { Request, Response } from "../../../../Source";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


// npx nodemon Tests/Manual/Subdomains/OneStatic/OneStaticSubdomain.test.ts
Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  routing: [
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Main domain</h1>"
        });
      }
    }
  ],
  subdomains: {
    calendar: {
      routing: [
        {
          route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
          async handler(_request: Request, response: Response): Promise<void> {
            return response.submitWithSuccess({
              HTML_Content: "<h1>Subdomain 'calendar'.</h1>"
            });
          }
        }
      ]
    }
  }
});
