import { Request, Response, Controller, BooleanParameterDefaultPreValidationModifier } from "@yamato-daiwa/backend";
import {
  HTTP_Methods,
  RawObjectDataProcessor,
  convertPotentialStringToNumberIfPossible
} from "@yamato-daiwa/es-extensions";


export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products",
    queryParametersProcessing: {
      paginationPageNumber: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
        type: Number,
        required: true,
        numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
      },
      itemsCountPerPaginationPage: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
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
        preValidationModifications: BooleanParameterDefaultPreValidationModifier,
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

    console.log(`paginationPageNumber: ${paginationPageNumber} (${typeof paginationPageNumber})`);
    console.log(`itemsCountPerPaginationPage: ${itemsCountPerPaginationPage} (${typeof itemsCountPerPaginationPage})`);
    console.log(
      `searchingByFullOrPartialProductName: ` +
      `${searchingByFullOrPartialProductName} (${typeof searchingByFullOrPartialProductName})`
    );
    console.log(`mustIncludeProductsOutOfStock: ${mustIncludeProductsOutOfStock} (${typeof mustIncludeProductsOutOfStock})`);

    return response.submitWithSuccess({
      HTML_Content: "<h1>Products list</h1>"
    });
  }

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products/:ID",
    pathParametersProcessing: {
      ID: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
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
