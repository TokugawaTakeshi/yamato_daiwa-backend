import type InvalidRoutePathParametersError from "./InvalidRoutePathParametersError";
import { isNonEmptyString } from "@yamato-daiwa/es-extensions";


export const invalidRoutePathParametersError__english: InvalidRoutePathParametersError.Localization = {
  defaultTitle: "Invalid Route Path Parameters",
  generateDescription:
      (
        {
          route,
          preFormattedValidationErrorsMessage,
          messageSpecificPart
        }: InvalidRoutePathParametersError.Localization.Description.TemplateVariables
      ): string => [
        "Invalid route path parameter(s) detected",
        ...isNonEmptyString(route) ? [ ` for the route "${ route }" ` ] : [],
        ":\n",
        preFormattedValidationErrorsMessage,
        ...isNonEmptyString(messageSpecificPart) ? [ `\n${ messageSpecificPart }` ] : []
      ].join("")
};


export default invalidRoutePathParametersError__english;
