import invalidRoutePathParametersError__english from "./InvalidRoutePathParametersErrorLocalization.english";


class InvalidRoutePathParametersError extends Error {

  public static readonly NAME: string = "InvalidRoutePathParametersError";

  public static localization: InvalidRoutePathParametersError.Localization = invalidRoutePathParametersError__english;


  public constructor(compoundParameter: InvalidRoutePathParametersError.ConstructorParameter) {

    super();

    this.name = InvalidRoutePathParametersError.NAME;

    this.message = "customMessage" in compoundParameter ?
        compoundParameter.customMessage :
        InvalidRoutePathParametersError.localization.generateDescription(compoundParameter);

  }

}


namespace InvalidRoutePathParametersError {

  export type ConstructorParameter = Localization.Description.TemplateVariables | Readonly<{ customMessage: string; }>;

  export type Localization = Readonly<{
    defaultTitle: string;
    generateDescription: (templateVariables: Localization.Description.TemplateVariables) => string;
  }>;

  export namespace Localization {
    export namespace Description {
      export type TemplateVariables = Readonly<{
        route?: string;
        preFormattedValidationErrorsMessage: string;
        messageSpecificPart?: string;
      }>;
    }
  }

}


export default InvalidRoutePathParametersError;
