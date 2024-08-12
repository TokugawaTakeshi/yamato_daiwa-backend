import invalidURI_QueryParametersError__english from "./InvalidURI_QueryParametersErrorLocalization.english";


class InvalidURI_QueryParametersError extends Error {

  public static readonly NAME: string = "InvalidURI_QueryParametersError";

  public static localization: InvalidURI_QueryParametersError.Localization = invalidURI_QueryParametersError__english;


  public constructor(compoundParameter: InvalidURI_QueryParametersError.ConstructorParameter) {

    super();

    this.name = InvalidURI_QueryParametersError.NAME;

    this.message = "customMessage" in compoundParameter ?
        compoundParameter.customMessage :
        InvalidURI_QueryParametersError.localization.generateDescription(compoundParameter);

  }

}


namespace InvalidURI_QueryParametersError {

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


export default InvalidURI_QueryParametersError;
