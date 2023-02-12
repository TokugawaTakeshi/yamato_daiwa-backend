import type ServerLocalization from "./ServerLocalization";
import type { SuccessLog } from "@yamato-daiwa/es-extensions";
import {
  PoliteErrorsMessagesBuilder,
  ImproperUsageError
} from "@yamato-daiwa/es-extensions";


const ServerLocalization__English: ServerLocalization = {

  errors: {
    IP_AddressDoesNotMatchWithSpecifiedDomain: {
      generateDescription: ({ domain, IP_Address }: { domain: string; IP_Address: string; }): string =>
          `The domain '${ domain }' does not refer to specified IP-address '${ IP_Address }'. This domain will be ignored.`
    },
    domainValidationMalfunction: {
      generateDescription: ({ domain }: { domain: string; }): string =>
          `The unexpected error occurred during validation of domain '${ domain }'. We are sorry, ` +
          "but for the preventing of unexpected bugs we have to exclude this domain from the basic domain array."
    },

    serverStartingFailed: {
      title: "Server starting failed",
      description: PoliteErrorsMessagesBuilder.buildMessage({
        technicalDetails: "Uncaught during server starting errors left.",
        politeExplanation: "During server starting, various malfunctions could occur because of bugs, invalid configuration " +
            "and externals causes like network connection. From us, the framework developers, it is required to handle " +
            "each case and give the accurate case report. However error which occurred this time was out of our foresight."
      })
    },

    requestMasterListenerDidNotCatchAllErrors: PoliteErrorsMessagesBuilder.buildMessage({
      technicalDetails: "The 'requestMasterHandler' did not catch all errors.",
      politeExplanation: "We designed the framework such as all errors be caught inside main requests handler. " +
          "However, this bug occurred means we missing some conditions or their combinations."
    }),

    HTTP_RequestsServingBootstrapError: {
      title: "HTTP request serving bootstrapping failure",
      description: "The error occurred during bootstrapping of HTTP server."
    },

    HTTPS_RequestsServingBootstrapError: {
      title: "HTTPS request serving bootstrapping failure",
      description: "The error occurred during bootstrapping of HTTP server."
    },

    HTTP_MethodIsNotDefined: "The HTTP method is not defined.",

    invalidHTTP_Method: ({ HTTP_Method }: { HTTP_Method: string; }): string =>
        `The HTTP method '${ HTTP_Method }' is not supported.`,

    requestURL_IsNotDefined: "The request URL is not defined.",

    URI_PathAndQueryDecodingError: ({ URI_PathAndQuery }: { URI_PathAndQuery: string; }): string =>
        `Unable to decode the URI path and query '${ URI_PathAndQuery }'.`,

    missingHostHTTP_Header: {
      title: "Required HTTP header missing",
      description: "Required 'Host' HTTP header is missing while it must be sent in all HTTP/1.1 request messages."
    },

    hostHTTP_HeaderParsingFailed: {
      title: "Host HTTP header parsing failed",
      generateDescription: ({ rawHostHTTP_Header }: { rawHostHTTP_Header: string; }): string =>
          `Below 'Host' HTTP header\n${ rawHostHTTP_Header }\n is invalid or parser bug occurred.`
    },

    wrongPortNumberInHostHTTP_Header: {
      title: "Wrong host number in HTTP Header",
      generateDescription: (
        { portNumberInHostHTTP_Header, rightPortNumber }: { portNumberInHostHTTP_Header: number; rightPortNumber: number; }
      ): string => `"The port humber ${ portNumberInHostHTTP_Header } specified in 'Host' HTTP header does not match with ` +
          `actually listened port number ${ rightPortNumber }. `
    },

    unknownSubdomain: {
      title: "Unknown subdomain",
      generateDescription: ({ requestedSubdomain }: { requestedSubdomain: string; }): string =>
          `No config has been found for requested subdomain '${ requestedSubdomain }'.`
    },

    invalidRoutePathParameters: {
      title: "Invalid route path parameters",
      generateDataNameForDescription: ({ targetURI }: { targetURI: string; }): string =>
          `Path parameters of '${ targetURI }' route`,
      generateDescription:
          ({ formattedPreIndentedValidationErrorsMessages }: { formattedPreIndentedValidationErrorsMessages: string; }): string =>
              `Invalid route path parameters detected. ${ formattedPreIndentedValidationErrorsMessages }`
    },

    invalidRouteQueryParameters: {
      title: "Invalid route query parameters",
      generateDataNameForDescription: ({ targetURI }: { targetURI: string; }): string =>
          `Deserialized query parameters of ${ targetURI } route`,
      generateDescription:
          ({ formattedPreIndentedValidationErrorsMessages }: { formattedPreIndentedValidationErrorsMessages: string; }): string =>
              `Invalid query parameters detected. ${ formattedPreIndentedValidationErrorsMessages }`
    },

    unableToAccessToProcessedRoutePathParameters: {
      title: ImproperUsageError.localization.defaultTitle,
      description: "'request.getProcessedRoutePathParameters' has been called while processing of URI path parameters " +
          "has not been defined at 'route.pathParameterProcessing'."
    },

    unableToAccessToProcessedRouteQueryParameters: {
      title: ImproperUsageError.localization.defaultTitle,
      description: "'request.getProcessedQueryParameters' has been called while processing of URI query parameters " +
          "has not been defined at 'route.queryParametersProcessing'."
    },

    middlewareExecutionFailed: {
      title: "Middleware execution failed",
      description: "Error occurred during middleware execution."
    },

    routeHandlerExecutionFailed: {
      title: "Router handler execution failed",
      description: "Error occurred during route handler execution."
    },

    requestedResourceNotFound: {
      title: "Requested resource not found",
      generateDescription: ({ potentialRawRelatedPathToPublicFile }: { potentialRawRelatedPathToPublicFile: string; }): string =>
        `Public file refers to '${ potentialRawRelatedPathToPublicFile }' was not found.`
    },

    fileStatisticsRetrievingFailure: "Unexpected error occurred during retrieving of the file statistics.",

    directoryInsteadOfFileHasBeenRequested: {
      title: "Directory has been requested",
      generateDescription: ({ targetPath }: { targetPath: string; }): string =>
          `The directory with path '${ targetPath }' has been requested. Was it consciously?`
    },

    publicFileSubmittingFailed: {
      title: "Public file submitting failed",
      generateDescription: ({ targetPath }: { targetPath: string; }): string => `Failed to submit public file '${ targetPath }'.`
    }
  },

  notifications: {

    HTTP_RequestsServiceStarted: (
      templateNamedParameters: ServerLocalization.Notifications.HTTP_RequestsServiceStarted.DescriptionTemplateNamedParameters
    ): SuccessLog => ({
      title: "The serving of HTTP requests started",
      description: "Waiting for the HTTP requests on:\n" +
          `  IP address: ${ templateNamedParameters.IP_Address }\n` +
          `  Port: ${ templateNamedParameters.HTTP_Port }\n` +
          `  Starting URI: http://${ templateNamedParameters.IP_Address }:${ templateNamedParameters.HTTP_Port }`
    }),

    HTTPS_RequestsServiceStarted: (
      templateNamedParameters: ServerLocalization.Notifications.HTTPS_RequestsServiceStarted.DescriptionTemplateNamedParameters
    ): SuccessLog => ({
      title: "The serving of HTTPS requests started",
      description: "Waiting for the HTTPS requests on:\n" +
          `  IP address: ${ templateNamedParameters.IP_Address }\n` +
          `  Port: ${ templateNamedParameters.HTTPS_Port }` +
          `  Starting URI: https://${ templateNamedParameters.IP_Address }:${ templateNamedParameters.HTTPS_Port }`
    }),

    newRequest: {
      title: "New request"
    },

    nullBytePoisoningAttackAttemptDetected: {
      title: "Null byte poisoning attack attempt detected",
      generateDescription: ({ formattedHTTP_Headers }: { formattedHTTP_Headers: string; }): string =>
          "Below request URI including null byte which could be only injected maliciously. YDB " +
          `framework successfully parried this attack.\n${ formattedHTTP_Headers }`
    },

    directoryTraversalAttackSuspected: {
      title: "Directory traversal attack suspected",
      generateDescription:
          ({
             potentialRawRelatedPathToPublicFile,
             formattedPotentialNormalizedAbsolutePathsToPublicFile,
             formattedHTTP_RequestHeaders
           }: {
            potentialRawRelatedPathToPublicFile: string;
            formattedPotentialNormalizedAbsolutePathsToPublicFile: string;
            formattedHTTP_RequestHeaders: string;
          }): string =>
              `The request URI '${ potentialRawRelatedPathToPublicFile }' part including directory traversal what ` +
              "being frequently used to access the secret files. It could refer to one of below absolute paths: \n" +
              `${ formattedPotentialNormalizedAbsolutePathsToPublicFile }\n` +
              `The request headers are: \n${ formattedHTTP_RequestHeaders }\n` +
              "YDB framework will check is this path public first."
    }
  }
};


export default ServerLocalization__English;
