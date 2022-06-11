import type CategoryGateway from "@Gateways/CategoryGateway";
import CategoryInteractions from "@Interactions/ClientAndFrontServer/CategoryInteractions";
import CategorySchema from "../Entities/Category.fromServer";

import FetchAPI_Service from "../../../Service/FetchAPI_Service";
import { RawObjectDataProcessor } from "@yamato-daiwa/es-extensions";


export default class CategoryFetchAPI_Gateway implements CategoryGateway {

  public async retrieveSelection(
    requestParameters: CategoryGateway.SelectionRetrieving.RequestParameters
  ): Promise<CategoryGateway.SelectionRetrieving.ResponseData> {
    return FetchAPI_Service.retrieveData({
      alternatingURI_PathPart: CategoryInteractions.SelectionRetrieving.URI_PATH,
      URI_QueryParameters: requestParameters,
      validResponseDataSpecification: {
        nameForLogging: "CategoryFetchAPI_Gateway.SelectionRetrieving.RequestParameters",
        subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
        properties: {

          selection__actualForSpecifiedPaginationPage: {
            type: Array,
            required: true,
            element: {
              type: Object,
              properties: CategorySchema
            }
          },
          selectionItemsCount: {
            type: Number,
            numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger,
            required: true
          },

          totalItemsCount: {
            type: Number,
            numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger,
            required: true
          }
        }
      }
    });
  }
}
