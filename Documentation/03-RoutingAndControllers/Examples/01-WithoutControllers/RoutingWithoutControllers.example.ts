import { Server, Request, Response, Router } from "@yamato-daiwa/backend";
import { HTTP_Methods, HTTP_StatusCodes } from "@yamato-daiwa/es-extensions";


/* Running the test:
*  npx nodemon 03-RoutingAndControllers/Examples/01-WithoutControllers/RoutingWithoutControllers.example.ts
* */
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
