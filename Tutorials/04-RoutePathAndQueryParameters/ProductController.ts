import { Request, Response, Controller } from "@yamato-daiwa/backend";
import {
  HTTP_Methods,
  RawObjectDataProcessor,
  convertUnknownToIntegerIfPossible,
  isString
} from "@yamato-daiwa/es-extensions";


export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products",
    queryParametersProcessing: {
      paginationPageNumber: {
        preValidationModifications: convertUnknownToIntegerIfPossible,
        type: Number,
        required: true,
        numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
      },
      itemsCountPerPaginationPage: {
        preValidationModifications: convertUnknownToIntegerIfPossible,
        type: Number,
        required: true,
        numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
      },
      searchingByFullOrPartialProductName: {
        type: String,
        required: false,
        minimalCharactersCount: 2
      },
      mustIncludeProductsOutOfStock: {
        preValidationModifications: (rawValue: unknown): boolean => (isString(rawValue) && rawValue !== "false"),
        type: Boolean,
        defaultValue: false
      }
    }
  })
  public async generateProductsPage(request: Request, response: Response): Promise<void> {

    // Don't worry - will refactor it
    const {
      paginationPageNumber,
      itemsCountPerPaginationPage,
      searchingByFullOrPartialProductName,
      mustIncludeProductsOutOfStock
    }: {
      paginationPageNumber: number,
      itemsCountPerPaginationPage: number,
      searchingByFullOrPartialProductName?: string,
      mustIncludeProductsOutOfStock?: boolean;
    } = request.getProcessedQueryParameters();

    console.log(paginationPageNumber);
    console.log(itemsCountPerPaginationPage);
    console.log(searchingByFullOrPartialProductName);
    console.log(mustIncludeProductsOutOfStock);

    return response.submitWithSuccess({
      HTML_Content: "<h1>Products list</h1>"
    });
  }

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products/:Id",
    pathParameterProcessing: {
      ID: {
        preValidationModifications: convertUnknownToIntegerIfPossible,
        type: Number,
        required: true,
        numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger
      }
    }
  })
  public async generateProductProfilePage(request: Request, response: Response): Promise<void> {

    const targetProductID: number = request.getProcessedRoutePathParameters<{ ID: number; }>().ID;

    return response.submitWithSuccess({
      HTML_Content: `<h1>Product with ID: ${targetProductID}</h1>`
    });
  }
}
