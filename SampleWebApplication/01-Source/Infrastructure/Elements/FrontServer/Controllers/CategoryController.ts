import Category from "@EnterpriseBusinessRules/Category";

import type CategoryGateway from "@Gateways/CategoryGateway";

import CategoryInteractions from "../../../Interactions/ClientAndFrontServer/CategoryInteractions";

import FrontServerDependenciesInjector from "../FrontServerDependencies";

import type {
  Request,
  Response
} from "@yamato-daiwa/backend";
import {
  Controller
} from "@yamato-daiwa/backend";

import {
  RawObjectDataProcessor,
  convertUnknownToIntegerIfPossible
} from "@yamato-daiwa/es-extensions";


export default class CategoryController extends Controller {

  private readonly categoryGateway: CategoryGateway = FrontServerDependenciesInjector.gateways.category;


  @Controller.RouteHandler({
    HTTP_Method: CategoryInteractions.SelectionRetrieving.HTTP_METHOD,
    pathTemplate: CategoryInteractions.SelectionRetrieving.URI_PATH,
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
      searchingByFullOrPartialName: {
        type: String,
        required: false,
        minimalCharactersCount: CategoryInteractions.SelectionRetrieving.QueryParameters.
            SearchingByFullOrPartialName.MINIMAL_CHARACTERS_COUNT
      }
    }
  })
  protected async retrieveSelection(request: Request, response: Response): Promise<void> {

    const {
      itemsCountPerPaginationPage,
      paginationPageNumber,
      searchingByFullOrPartialName
    }: CategoryInteractions.SelectionRetrieving.QueryParameters = request.
        getProcessedQueryParameters<CategoryInteractions.SelectionRetrieving.QueryParameters>();

    return response.submitWithSuccess({
      JSON_Content: await this.categoryGateway.retrieveSelection({
        paginationPageNumber,
        itemsCountPerPaginationPage,
        searchingByFullOrPartialName
      })
    });
  }


  @Controller.RouteHandler({
    HTTP_Method: CategoryInteractions.RetrievingByID.HTTP_METHOD,
    pathTemplate: CategoryInteractions.RetrievingByID.URI_Path.TEMPLATE,
    pathParameterProcessing: {
      [CategoryInteractions.RetrievingByID.URI_Path.Parameters.Names.categoryID]: {
        type: String,
        required: true,
        minimalCharactersCount: Category.ID.MINIMAL_CHARACTERS_COUNT
      }
    }
  })
  protected async retrieveByID(request: Request, response: Response): Promise<void> {
    await response.submitWithSuccess({
      JSON_Content: await this.categoryGateway.retrieveByID(
        request.getProcessedRoutePathParameters<CategoryInteractions.RetrievingByID.URI_Path.Parameters>().categoryID
      )
    });
  }
}
