import type Server from "./Server";
import { PoliteErrorsMessagesBuilder } from "@yamato-daiwa/es-extensions";


const serverLocalization__english: Server.Localization = {

  errors: {

    IP_AddressDoesNotMatchWithSpecifiedDomain: {
      generateDescription: (
        {
          domain,
          IP_Address
        }: Server.Localization.Errors.IP_AddressDoesNotMatchWithSpecifiedDomain.TemplateVariables
      ): string =>
          `The domain "${ domain }" does not refer to specified IP-address "${ IP_Address }". ` +
          "This domain will be ignored."
    },

    domainValidationMalfunction: {
      generateMessage: ({ domain }: Server.Localization.Errors.DomainValidationMalfunction.TemplateVariables): string =>
          `The unexpected error occurred during validation of domain "${ domain }". ` +
          "We are sorry, but for the preventing of unexpected bugs we have to exclude this domain from the basic " +
            "domain array."
    },

    serverStartingFailed: {
      title: "Server Starting Failed",
      description: PoliteErrorsMessagesBuilder.buildMessage({
        technicalDetails: "Uncaught during server starting errors left.",
        politeExplanation:
            "During server starting, various malfunctions could occur because of bugs, invalid configuration " +
              "and externals causes like network connection. " +
            "From us, the framework developers, it is required to handle each case and give the accurate case report. " +
            "However error which occurred this time was out of our foresight."
      })
    },

    requestMasterListenerDidNotCatchAllErrors: PoliteErrorsMessagesBuilder.buildMessage({
      technicalDetails: "The \"requestMasterHandler\" has not caught all errors.",
      politeExplanation:
          "We have designed the framework such as all errors be caught inside main requests handler. " +
          "However, this bug has occurred means that we missing some conditions or their combinations."
    }),

    HTTP_RequestsServingBootstrapError: {
      title: "HTTP Request Serving Bootstrapping Failure",
      description: "The error occurred during bootstrapping of HTTP server."
    },

    HTTPS_RequestsServingBootstrapError: {
      title: "HTTPS Request Serving Bootstrapping Failure",
      description: "The error occurred during bootstrapping of HTTPS server."
    },

    HTTP_MethodIsNotDefined: "The HTTP method is not defined at request.",

    unsupportedHTTP_Method: {
      generateMessage: ({ HTTP_Method }: Server.Localization.Errors.InvalidHTTP_Method.TemplateVariables): string =>
          `The HTTP method "${ HTTP_Method }" is not supported.`
    },

    requestURL_IsNotDefined: "The request URL is not defined.",

    URI_PathAndQueryDecoding: {
      generateMessage: (
        { URI_PathAndQuery }: Server.Localization.Errors.URI_PathAndQueryDecoding.TemplateVariables
      ): string =>
          `Unable to decode the URI path and query '${ URI_PathAndQuery }'.`
    },

    missingHostHTTP_Header: {
      title: "Required HTTP Header is Missing",
      description: "The \"Host\" HTTP header is missing while it must be sent in all HTTP/1.1 request messages."
    },

    hostHTTP_HeaderParsingFailed: {
      title: "Host HTTP Header Parsing Failed",
      generateDescription: (
        { rawHostHTTP_Header }: Server.Localization.Errors.HostHTTP_HeaderParsingFailed.TemplateVariables
      ): string =>
          `Below "Host" HTTP header\n${ rawHostHTTP_Header }\n is invalid or parser bug occurred.`
    },

    wrongPortNumberInHostHTTP_Header: {
      title: "Wrong Host Number in HTTP Header",
      generateDescription: (
        {
          portNumberInHostHTTP_Header,
          rightPortNumber
        }: Server.Localization.Errors.WrongPortNumberInHostHTTP_Header.TemplateVariables
      ): string =>
          `"The port humber ${ portNumberInHostHTTP_Header } specified in "Host" HTTP header does not match with ` +
            `actually listened port number ${ rightPortNumber }. `
    },

    unknownSubdomain: {
      title: "Unknown Subdomain",
      generateDescription: (
        { requestedSubdomain }: Server.Localization.Errors.UnknownSubdomain.TemplateVariables
      ): string =>
          `No configuration has been found for requested subdomain "${ requestedSubdomain }".`
    },

    middlewareExecutionFailed: {
      title: "Middleware Execution Failed",
      description: "Error occurred during middleware execution."
    },

    routeHandlerExecutionFailed: {
      title: "Router Handler Execution Failed",
      description: "Error occurred during route handler execution."
    },

    requestedResourceNotFound: {
      title: "Requested Resource not Found",
      generateDescription:
          (
            {
              potentialRawRelatedPathToPublicFile
            }: Server.Localization.Errors.RequestedResourceNotFound.TemplateVariables
          ): string =>
              `The path "${ potentialRawRelatedPathToPublicFile }" refers to unknown resource.`
    },

    fileStatisticsRetrievingFailure: "Unexpected error occurred during retrieving of the file statistics.",

    directoryInsteadOfFileHasBeenRequested: {
      title: "Directory has been requested",
      generateDescription:
          ({ targetPath }: Server.Localization.Errors.DirectoryInsteadOfFileHasBeenRequested.TemplateVariables): string =>
              `The directory with path '${ targetPath }' has been requested. Was it consciously?`
    },

    publicFileSubmittingFailed: {
      title: "Public File Submitting Failed",
      generateDescription:
          ({ targetPath }: Server.Localization.Errors.PublicFileSubmittingFailed.TemplateVariables): string =>
              `Failed to submit public file "${ targetPath }".`
    }
  },

  notifications: {

    HTTP_RequestsServingStarted: {
      title: "The Serving of HTTP Requests Started",
      generateDescription: (
        { IP_Address, HTTP_Port }: Server.Localization.Notifications.HTTP_RequestsServiceStarted.TemplateVariables
      ): string =>
          "Waiting for the HTTP requests on:\n" +
          `  IP Address: ${ IP_Address }\n` +
          `  Port: ${ HTTP_Port }\n` +
          `  Starting URI: http://${ IP_Address }:${ HTTP_Port }`
    },

    HTTPS_RequestsServingStarted: {
      title: "The Serving of HTTPS Requests Started",
      generateDescription: (
        { IP_Address, HTTPS_Port }: Server.Localization.Notifications.HTTPS_RequestsServiceStarted.TemplateVariables
      ): string =>
          "Waiting for the HTTPS requests on:\n" +
          `  IP Address: ${ IP_Address }\n` +
          `  Port: ${ HTTPS_Port }\n` +
          `  Starting URI: https://${ IP_Address }:${ HTTPS_Port }`
    },

    newRequest: "New Request",

    nullBytePoisoningAttackAttemptDetected: {
      title: "Null Byte Poisoning Attack Attempt Detected",
      generateDescription:
          (
            {
              formattedHTTP_Headers
            }: Server.Localization.Notifications.NullBytePoisoningAttackAttemptDetected.TemplateVariables
          ): string =>
              "Below request URI including null byte which could be only injected maliciously. " +
              "YDB framework successfully parried this attack.\n" +
              formattedHTTP_Headers
    },

    directoryTraversalAttackSuspected: {
      title: "Directory Traversal Attack Suspected",
      generateDescription:
          (
            {
              potentialRawRelatedPathToPublicFile,
              formattedPotentialNormalizedAbsolutePathsToPublicFile,
              formattedHTTP_RequestHeaders
            }: Server.Localization.Notifications.DirectoryTraversalAttackSuspected.TemplateVariables
          ): string =>
              `The request URI "${ potentialRawRelatedPathToPublicFile }" part including directory traversal what ` +
                "being frequently used to access the secret files. " +
              "It could refer to one of below absolute paths: \n" +
              `${ formattedPotentialNormalizedAbsolutePathsToPublicFile }\n` +
              `The request headers are: \n${ formattedHTTP_RequestHeaders }\n` +
              "YDB framework will check is this path public first."
    }

  }

};


export default serverLocalization__english;
