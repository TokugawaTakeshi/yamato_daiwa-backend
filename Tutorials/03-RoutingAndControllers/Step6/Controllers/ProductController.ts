import Routing from "../Routing";
import { Request, Response, Controller } from "@yamato-daiwa/backend";
import { convertPotentialStringToIntegerIfPossible, RawObjectDataProcessor } from "@yamato-daiwa/es-extensions";


export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: Routing.Pages.Product.List.HTTP_METHOD,
    pathTemplate: Routing.Pages.Product.List.URI_PATH
  })
  public async generateProductsPage(_request: Request, response: Response): Promise<void> {
    return response.submitWithSuccess({
      HTML_Content: "<h1>Products list</h1>"
    });
  }

  @Controller.RouteHandler({
    HTTP_Method: Routing.Pages.Product.Details.HTTP_METHOD,
    pathTemplate: Routing.Pages.Product.Details.URI_PathTemplate,
    pathParametersProcessing: {
      ID: {
        preValidationModifications: convertPotentialStringToIntegerIfPossible,
        type: Number,
        required: true,
        numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger
      }
    }
  })
  public async generateProductProfilePage(request: Request, response: Response): Promise<void> {

    const targetProductID: number = request.getRoutePathParameters<{ ID: number; }>().ID;

    console.log(typeof targetProductID);

    return response.submitWithSuccess({
      HTML_Content: `<h1>Product with ID: ${ targetProductID }</h1>`
    });

  }

}
