import ProductTransactions from "./ProductTransactions";
import { Request, Response, Controller, BooleanParameterDefaultPreValidationModifier } from "@yamato-daiwa/backend";
import { RawObjectDataProcessor, convertPotentialStringToNumberIfPossible } from "@yamato-daiwa/es-extensions";


export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: ProductTransactions.SelectionRetrieving.HTTP_METHOD,
    pathTemplate: ProductTransactions.SelectionRetrieving.URI_PATH,
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
      forcedFiltering: {
        type: Object,
        required: false,
        properties: {
          makerID: {
            preValidationModifications: convertPotentialStringToNumberIfPossible,
            type: Number,
            required: true,
            numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
          }
        }
      },
      consciousFiltering: {
        type: Object,
        required: false,
        properties: {
          fullOrPartialProductName: {
            type: String,
            required: false,
            minimalCharactersCount: 2
          },
          outOfStock: {
            preValidationModifications: BooleanParameterDefaultPreValidationModifier,
            type: Boolean,
            required: false
          },
          categoriesIDs: {
            type: Array,
            required: false,
            element: {
              preValidationModifications: convertPotentialStringToNumberIfPossible,
              type: Number,
              numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
            }
          }
        }
      }
    }
  })
  public async retrieveProductsSelection(request: Request, response: Response): Promise<void> {

    const {
      paginationPageNumber,
      itemsCountPerPaginationPage,
      forcedFiltering,
      consciousFiltering
    }: ProductTransactions.SelectionRetrieving.QueryParameters = request.getProcessedQueryParameters();

    console.log(request.URI);
    console.log(paginationPageNumber);
    console.log(itemsCountPerPaginationPage);
    console.log(forcedFiltering);
    console.log(consciousFiltering);

    return response.submitWithSuccess({
      JSON_Content: []
    });
  }
}
