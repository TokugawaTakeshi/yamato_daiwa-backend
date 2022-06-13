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


## Quick examples

### "Hello, world!"

```typescript
import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  routing: [
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
      async handler(request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Hello, world!</h1>"
        });
      }
    }
  ]
});
```

See the ["Hello, world!" tutorial](Tutorials/01-HelloWorld/README.md) for the details.


### HTTPS support

```typescript
import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  HTTPS: {
    port: ProtocolDependentDefaultPorts.HTTPS,
    SSL_CertificateFileRelativeOrAbsolutePath: "SSL/cert.pem",
    SSL_KeyFileRelativeOrAbsolutePath: "SSL/key.pem"
  },
  routing: [
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Hello, world!</h1>"
        });
      }
    }
  ]
});
```
See the [HTTPS support tutorial](Tutorials/02-HTTPS_Support/README.md) for the details.


### Routing and controllers
#### Entry point

```typescript
import ProductController from "./ProductController";

import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  routing: [
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top page</h1>"
        });
      }
    },
    ProductController
  ]
});
```


#### Controller

```typescript
import { Request, Response, Controller } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products"
  })
  public async generateProductsPage(_request: Request, response: Response): Promise<void> {
    return response.submitWithSuccess({
      HTML_Content: "<h1>Products list</h1>"
    });
  }

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products/:ID"
  })
  public async generateProductProfilePage(request: Request, response: Response): Promise<void> {
    return response.submitWithSuccess({
      HTML_Content: `<h1>Product with ID: ${request.routePathParameters.ID}</h1>`
    });
  }
}
```

See the [Routing and controllers tutorial](Tutorials/03-RoutingAndControllers/README.md) for the details.


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
