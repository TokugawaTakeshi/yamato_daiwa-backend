# Yamato-Daiwa Backend [YDB]

Back-end framework with build-in TypeScript type safety.
Intended to be used in full-stack applications where both client and server part written in TypeScript.

![Main visual of Yamato-Daiwa Backend framework](https://user-images.githubusercontent.com/41653501/168190921-78edc07d-58cc-4298-8b59-182468cf280a.png)

* [Main package](MainPackage/README.md)
* [🌎 Issues](https://github.com/TokugawaTakeshi/yamato_daiwa-backend/issues)


## Installation

```
npm i @yamato-daiwa/backend -E
```


## Quick example

```typescript
import { HTTP_Methods, HTTP_StatusCodes } from "@yamato-daiwa/es-extensions";
import { Server, Request, Response } from "@yamato-daiwa/backend";


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: 1337 },
  routing: [
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
      async handler(request: Request, response: Response): Promise<void> {
        console.log(request);
        return response.submitWithSuccess({
          statusCode: HTTP_StatusCodes.OK,
          HTML_Content: "<h1>Hello, world!</h1>"
        });
      }
    }
  ]
});
```

See the ["Hello, world!" tutorial](Tutorials/01-HelloWorld/README.md) for the details.


## Functionality tutorials

Please take the tutorials in following order.

<dl>

  <dt><a href="Tutorials/01-HelloWorld/README.md">Hello, world!</a></dt>
  <dd>Retrieving on HTML code by HTTP</dd>

  <dt><a href="Tutorials/02-HTTPS_Support/README.md">HTTPS support</a></dt>
  <dd>Serving of both <b>HTTP</b> and <b>HTTPS</b></dd>

  <dt><a href="Tutorials/03-RoutingAndControllers/README.md">Routing and controllers</a></dt>
  <dd>Defining the routing without and with controllers</dd>

  <dt><a href="Tutorials/04-RoutePathAndQueryParameters/README.md">Route path and query parameters</a></dt>
  <dd>Dealing with route path and query parameters type-safely</dd>

</dl>
