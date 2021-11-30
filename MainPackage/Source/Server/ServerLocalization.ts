import type { Log } from "@yamato-daiwa/es-extensions";


type ServerLocalization = {

  errors: {
    IP_AddressDoesNotMatchWithSpecifiedDomain: {
      generateDescription: (templateNamedParameters: { domain: string; IP_Address: string; }) => string;
    };
    domainValidationMalfunction: {
      generateDescription: (templateNamedParameters: { domain: string; }) => string;
    };
    serverStartingFailed: Pick<Log, "title" | "description">;
    requestMasterListenerDidNotCatchAllErrors: string;
    HTTP_RequestsServingBootstrapError: Pick<Log, "title" | "description">;
    HTTPS_RequestsServingBootstrapError: Pick<Log, "title" | "description">;
    HTTP_MethodIsNotDefined: string;
    invalidHTTP_Method: (templateNamedParameters: { HTTP_Method: string; }) => string;
    requestURL_IsNotDefined: string;
    URI_PathAndQueryDecodingError: (templateNamedParameters: { URI_PathAndQuery: string; }) => string;
    missingHostHTTP_Header: Pick<Log, "title" | "description">;
    hostHTTP_HeaderParsingFailed: Pick<Log, "title"> &
        { generateDescription: (templateNamedParameters: { rawHostHTTP_Header: string; }) => string; };
    wrongPortNumberInHostHTTP_Header:
        Pick<Log, "title"> &
        { generateDescription: (templateNamedParameters: {
          portNumberInHostHTTP_Header: number;
          rightPortNumber: number;
        }) => string; };
    unknownSubdomain: Pick<Log, "title"> &
        { generateDescription: (templateNamedParameters: { requestedSubdomain: string; }) => string; };
    invalidRoutePathParameters:
        Pick<Log, "title"> &
        {
          generateDataNameForDescription: (templateNamedParameters: { targetURI: string; }) => string;
          generateDescription: (templateNamedParameters: { formattedPreIndentedValidationErrorsMessages: string; }) => string;
        };
    invalidRouteQueryParameters:
        Pick<Log, "title"> &
        {
          generateDataNameForDescription: (templateNamedParameters: { targetURI: string; }) => string;
          generateDescription: (templateNamedParameters: { formattedPreIndentedValidationErrorsMessages: string; }) => string;
        };
    unableToAccessToProcessedRoutePathParameters: Pick<Log, "title" | "description">;
    unableToAccessToProcessedRouteQueryParameters: Pick<Log, "title" | "description">;
    middlewareExecutionFailed: Pick<Log, "title" | "description">;
    routeHandlerExecutionFailed: Pick<Log, "title" | "description">;
    requestedResourceNotFound: Pick<Log, "title"> &
        { generateDescription: (templateNamedParameters: { potentialRawRelatedPathToPublicFile: string; }) => string; };
    fileStatisticsRetrievingFailure: string;
    directoryInsteadOfFileHasBeenRequested: Pick<Log, "title"> &
        { generateDescription: (templateNamedParameters: { targetPath: string; }) => string; };
  };


  notifications: {
    HTTP_RequestsServiceStarted: (
      templateNamedParameters: ServerLocalization.Notifications.HTTP_RequestsServiceStarted.DescriptionTemplateNamedParameters
    ) => Pick<Log, "title" | "description">;
    HTTPS_RequestsServiceStarted: (
      templateNamedParameters: ServerLocalization.Notifications.HTTPS_RequestsServiceStarted.DescriptionTemplateNamedParameters
    ) => Pick<Log, "title" | "description">;
    newRequest: Pick<Log, "title">;
    nullBytePoisoningAttackAttemptDetected:
        Pick<Log, "title"> &
        { generateDescription: (templateNamedParameters: { formattedHTTP_Headers: string; }) => string; };
    directoryTraversalAttackSuspected:
        Pick<Log, "title"> &
        { generateDescription: (templateNamedParameters: {
          potentialRawRelatedPathToPublicFile: string;
          formattedPotentialNormalizedAbsolutePathsToPublicFile: string;
          formattedHTTP_RequestHeaders: string;
        }) => string; };
  };
};


/* eslint-disable-next-line @typescript-eslint/no-redeclare --
 * The merging of type/interface and namespace is completely valid TypeScript,
 * but @typescript-eslint community does not wish to support it.
 * https://github.com/eslint/eslint/issues/15504 */
namespace ServerLocalization {

  export namespace Notifications {

    export namespace HTTP_RequestsServiceStarted {
      export type DescriptionTemplateNamedParameters = {
        IP_Address: string;
        HTTP_Port: number;
      };
    }

    export namespace HTTPS_RequestsServiceStarted {
      export type DescriptionTemplateNamedParameters = {
        IP_Address: string;
        HTTPS_Port: number;
      };
    }
  }
}


export default ServerLocalization;
