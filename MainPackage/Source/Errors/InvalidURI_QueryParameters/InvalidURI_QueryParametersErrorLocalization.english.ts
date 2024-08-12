import type InvalidURI_QueryParametersError from "./InvalidURI_QueryParametersError";
import { isNonEmptyString } from "@yamato-daiwa/es-extensions";


export const invalidURI_QueryParametersError__english: InvalidURI_QueryParametersError.Localization = {
  defaultTitle: "Invalid URI Query Parameters",
  generateDescription:
      (
        {
          route,
          preFormattedValidationErrorsMessage,
          messageSpecificPart
        }: InvalidURI_QueryParametersError.Localization.Description.TemplateVariables
      ): string => [
        "Invalid URI query parameter(s) detected",
        ...isNonEmptyString(route) ? [ ` for the route "${ route }" ` ] : [],
        ":\n",
        preFormattedValidationErrorsMessage,
        ...isNonEmptyString(messageSpecificPart) ? [ `\n${ messageSpecificPart }` ] : []
      ].join("")
};


export default invalidURI_QueryParametersError__english;
