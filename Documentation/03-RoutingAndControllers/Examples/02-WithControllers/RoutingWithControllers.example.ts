import { Server, Request, Response, Router, Controller } from "@yamato-daiwa/backend";
import { HTTP_Methods, HTTP_StatusCodes } from "@yamato-daiwa/es-extensions";

/* 〔 ESLint muting rationale 〕 Basically controllers use "this" in their methods but this is a simplified example. */
/* eslint-disable class-methods-use-this */

/* Running the example:
*  npx nodemon 03-RoutingAndControllers/Examples/02-WithControllers/RoutingWithControllers.example.ts
* */
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
    ProductController
  ]
});
