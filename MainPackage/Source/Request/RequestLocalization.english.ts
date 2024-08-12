import type Request from "./Request";
import { ImproperUsageError } from "@yamato-daiwa/es-extensions";


const requestLocalization__english: Request.Localization = {

  errors: {

    unableToAccessToProcessedRoutePathParameters: {
      title: ImproperUsageError.localization.defaultTitle,
      description:
          "\"request.getRoutePathParameters\" has been called while processing of URI path parameters " +
            "has not been defined at \"route.pathParameterProcessing\"."
    },

    unableToAccessToProcessedURI_QueryParameters: {
      title: ImproperUsageError.localization.defaultTitle,
      description:
          "\"request.getURI_QueryParameters\" has been called while processing of URI query parameters " +
            "has not been defined at \"route.queryParametersProcessing\"."
    }

  },

  titles: {
    routePath: {
      generate: (
        { stringifiedRoute }: Request.Localization.Titles.RoutePath.DataName.TemplateVariables
      ): string =>
          `Path Parameters of "${ stringifiedRoute }" route`
    },
    URI_Query: {
      generate: (
        { stringifiedRoute }: Request.Localization.Titles.RoutePath.DataName.TemplateVariables
      ): string =>
          `URI Query Parameters of "${ stringifiedRoute }" route`
    }
  }

};


export default requestLocalization__english;
