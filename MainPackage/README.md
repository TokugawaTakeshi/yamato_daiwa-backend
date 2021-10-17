# `@yamato-daiwa/backend`

Back-end framework with build-in TypeScript type safety.
Intended to be used in full-stack applications where both client and server part written in TypeScript.


## Installation

```
npm i @yamato-daiwa/backend -E
```

## Quick example

```typescript
import { HTTP_Methods, HTTP_StatusCodes } from "@yamato-daiwa/es-extensions";
import { Server, Request, Response } from "@yamato-daiwa/backend";


Server.initializeAndStart({
  host: "127.0.0.1",
  HTTP: { port: 1337 },
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
```

See the ["Hello, world!" tutorial](../Documentation/01-HelloWorld/HelloWorld.md) for the details.


## Functionality tutorials

* [📖 Hello, world!](../Documentation/01-HelloWorld/HelloWorld.md) Retrieving on `<h1>Hello, world!</h1>` HTML code by HTTP.
* [📖 HTTPS support](../Documentation/02-HTTPS_Support/HTTPS_Support.md) Serving of both `HTTP` and `HTTPS`.
* [📖 Routing and controllers](../Documentation/03-RoutingAndControllers/RoutingAndControllers.md)
  Defining the routing without and with controllers.
* [📖 Subdomains](../Documentation/05-Subdomains/Subdomains.md)
  Defining the routing without and with controllers.
