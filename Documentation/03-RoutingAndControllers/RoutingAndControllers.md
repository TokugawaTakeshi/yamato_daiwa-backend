# Routing
## Defining the routes

Routes could be defined, obviously and MUST BE obviously, in `routing` property: 

```typescript
import { HTTP_Methods, HTTP_StatusCodes } from "@yamato-daiwa/es-extensions";
import { Server, Request, Response, Router } from "@yamato-daiwa/backend";

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
          HTML_Content: "<h1>Top page</h1>"
        });
      }
    },
    {
      route: { type: HTTP_Methods.get, pathTemplate: "/products/" },
      async handler(request: Request, response: Response): Promise<void> {
        console.log(request);
        return response.submit({
          statusCode: HTTP_StatusCodes.OK,
          HTML_Content: "<h1>Products list</h1>"
        });
      }
    },
    {
      route: { type: HTTP_Methods.get, pathTemplate: "/products/:ID" },
      async handler(request: Request, response: Response, routeParameters: Router.RouteParameters): Promise<void> {
        console.log(request);
        return response.submit({
          statusCode: HTTP_StatusCodes.OK,
          HTML_Content: `<h1>Product with ID: ${routeParameters.ID}</h1>`
        });
      }
    }
  ]
});
```

The `routing` property accepts the array of the objects `RouteAndHandlerPair` or controllers (will be explained in next
section):

```typescript
type RouteAndHandlerPair = { route: Route; handler: RouteHandler; };

type Route = {
  type: HTTP_Methods;
  pathTemplate: string;
};

type RouteHandler = (request: Request, response: Response, routeParameters: RouteParameters) => Promise<void>;

type RouteParameters = { [key: string]: string; };
```

* `pathTemplate` means that besides static URI path line `/foo/bar` the dynamic parameters like `:ID` in `/products/:ID` 
  case could be annotated.
* Prepended slashes could be omitted (`products/` is valid same as `/products/`).
* Appended slashes also could be omitted (`/products` or just `products` are valid same as `/products/`).


## Routing with controllers

Controllers are allowing to logically group the requests.
Let's move the second and third example to the `ProductController`:

```typescript
import { Controller, Router } from "@yamato-daiwa/backend";
import { HTTP_Methods, HTTP_StatusCodes } from "@yamato-daiwa/es-extensions";


class ProductController extends Controller {

  @Controller.RouteHandler({
    type: HTTP_Methods.get,
    pathTemplate: "products"
  })
  public async generateProductsPage(request: Request, response: Response): Promise<void> {
    console.log(request);
    return response.submit({
      statusCode: HTTP_StatusCodes.OK,
      HTML_Content: "<h1>Products list</h1>"
    });
  }

  @Controller.RouteHandler({
    type: HTTP_Methods.get,
    pathTemplate: "products/:ID"
  })
  public async generateProductProfilePage(
    request: Request, response: Response, routeParameters: Router.RouteParameters
  ): Promise<void> {
    console.log(request);
    return response.submit({
      statusCode: HTTP_StatusCodes.OK,
      HTML_Content: `<h1>Product with ID: ${routeParameters.ID}</h1>`
    });
  }
}
```

Now all we need to make this routes available is pass `ProductController` as element of `routing` array:

```typescript
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
          HTML_Content: "<h1>Top page</h1>"
        });
      }
    },
    ProductController  // <= Just it!
  ]
});
```

You even no need to create the instance of controller because the library takes care about routing.
Why `Server` can extract the routes from the `ProductController` is `ProductController` has been inhereted from
`Controller` class.
