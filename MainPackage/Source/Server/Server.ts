/* --- Native modules ----------------------------------------------------------------------------------------------- */
import HTTP from "http";
import HTTPS from "https";
import FileSystem from "fs";
import PromisfiedFileSystem from "fs/promises";
import Path from "path";
import DomainNameSystem from "dns/promises";

/* --- Framework's entities ----------------------------------------------------------------------------------------- */
import type Request from "../Request";
import Response from "../Response";
import Router from "../Router";
import Middleware from "../Middleware/Middleware";
import type URI_QueryParametersDeserializer from "../URI_QueryParametersDeserializer";

/* --- Build-in middleware ------------------------------------------------------------------------------------------ */
import CORS_Middleware from "../Middleware/CORS_Middleware";

/* --- Applied auxiliaries ------------------------------------------------------------------------------------------ */
import ConfigNormalizer from "../ConfigNormalizer/ConfigNormalizer";
import HostHTTP_HeaderParser from "../Utils/HostHTTP_HeaderParser";
import getSubdomainConfig from "../Utils/getSubdomainConfig";
import sendFileByStreams from "../Utils/sendFileByStreamsAPI";

/* --- General auxiliaries ------------------------------------------------------------------------------------------ */
import {
  HTTP_StatusCodes,
  HTTP_Methods,
  RawObjectDataProcessor,
  Logger,
  UnsupportedScenarioError,
  UnexpectedEventError,
  InvalidConfigError,
  ImproperUsageError,
  isUndefined,
  isElementOfEnumeration,
  isNotNull,
  stringifyAndFormatArbitraryValue,
  isNull,
  isNotUndefined,
  removeArrayElementsByPredicates,
  removeSpecificCharacter
} from "@yamato-daiwa/es-extensions";
import type { ParsedJSON_Object } from "@yamato-daiwa/es-extensions";
import {
  ConsoleApplicationLogger,
  isErrnoException
} from "@yamato-daiwa/es-extensions-nodejs";
import { ServerErrorsHTTP_StatusCodes } from "../UtilsIncubator/HTTP_StatusCodes";

/* --- Localization ------------------------------------------------------------------------------------------------- */
import type Localization from "./ServerLocalization";
import defaultLocalization from "./ServerLocalization.english";


class Server {

  private readonly config: Server.NormalizedConfig;
  private readonly middlewareHandlers: Array<Middleware> = [ CORS_Middleware ];
  private readonly localization: Localization = defaultLocalization;


  public static initializeAndStart(configuration: Server.RawConfig): Server {
    return new Server(configuration).start();
  }

  public static initialize(configuration: Server.RawConfig): Server {
    return new Server(configuration);
  }


  private constructor(rawConfig: Server.RawConfig) {
    this.config = ConfigNormalizer.normalize(rawConfig);
  }


  public start(): this {

    Promise.all(this.inspectSpecifiedBasicDomains()).

        then((): void => {
          this.startHTTP_RequestServingIfCorrespondingConfigDefined();
          this.startHTTPS_RequestServingIfCorrespondingConfigDefined();
        }).

        catch((error: unknown): void => {
          Logger.logError({
            errorType: "ServerStartingFailed",
            ...this.localization.errors.serverStartingFailed,
            occurrenceLocation: "Server.start()",
            caughtError: error
          });
        });

    return this;
  }


  private startHTTP_RequestServingIfCorrespondingConfigDefined(): void {

    if (isUndefined(this.config.HTTP)) {
      return;
    }


    const HTTP_Config: Server.NormalizedConfig.HTTP = this.config.HTTP;

    HTTP.

        createServer(
          (rawRequest: HTTP.IncomingMessage, rawResponse: HTTP.ServerResponse): void => {
            this.requestMasterHandler({
              rawRequest,
              rawResponse,
              protocol: Server.SupportedProtocols.HTTP,
              port: HTTP_Config.port
            }).
                catch((error: unknown): void => {

                  Logger.logError({
                    errorType: UnexpectedEventError.NAME,
                    title: UnexpectedEventError.localization.defaultTitle,
                    description: this.localization.errors.requestMasterListenerDidNotCatchAllErrors,
                    occurrenceLocation: "server.startHTTP_RequestServingIfCorrespondingConfigDefined()",
                    caughtError: error
                  });

                  rawResponse.writeHead(HTTP_StatusCodes.internalServerError).end();
                });
          }
        ).

        listen(HTTP_Config.port, this.config.IP_Address, (): void => {
          Logger.logSuccess(this.localization.notifications.HTTP_RequestsServiceStarted({
            IP_Address: this.config.IP_Address, HTTP_Port: HTTP_Config.port
          }));
        }).

        on("error", (error: Error): void => {
          Logger.logError({
            errorType: "HTTP_RequestsServingBootstrapError",
            ...this.localization.errors.HTTP_RequestsServingBootstrapError,
            occurrenceLocation: "server.startHTTP_RequestServingIfCorrespondingConfigDefined()",
            caughtError: error
          });
        });

  }

  private startHTTPS_RequestServingIfCorrespondingConfigDefined(): void {

    if (isUndefined(this.config.HTTPS)) {
      return;
    }


    const HTTPS_Config: Server.NormalizedConfig.HTTPS = this.config.HTTPS;

    HTTPS.

        createServer(
          {
            key: FileSystem.readFileSync(HTTPS_Config.SSL_KeyFileAbsolutePath),
            cert: FileSystem.readFileSync(HTTPS_Config.SSL_CertificateFileAbsolutePath)
          },
          (rawRequest: HTTP.IncomingMessage, rawResponse: HTTP.ServerResponse): void => {
            this.requestMasterHandler({
              rawRequest,
              rawResponse,
              protocol: Server.SupportedProtocols.HTTPS,
              port: HTTPS_Config.port
            }).
                catch((error: unknown): void => {

                  Logger.logError({
                    errorType: UnexpectedEventError.NAME,
                    title: UnexpectedEventError.localization.defaultTitle,
                    description: this.localization.errors.requestMasterListenerDidNotCatchAllErrors,
                    occurrenceLocation: "server.startHTTPS_RequestServingIfCorrespondingConfigDefined()",
                    caughtError: error
                  });

                  rawResponse.writeHead(HTTP_StatusCodes.internalServerError).end();
                });
          }
        ).

        listen(HTTPS_Config.port, this.config.IP_Address, (): void => {
          Logger.logSuccess(this.localization.notifications.HTTPS_RequestsServiceStarted({
            IP_Address: this.config.IP_Address, HTTPS_Port: HTTPS_Config.port
          }));
        }).

        on("error", (error: Error): void => {
          Logger.logError({
            errorType: "HTTPS_RequestsServingBootstrapError",
            ...this.localization.errors.HTTP_RequestsServingBootstrapError,
            occurrenceLocation: "server.startHTTPS_RequestServingIfCorrespondingConfigDefined()",
            caughtError: error
          });
        });
  }

  private async requestMasterHandler(
    {
      rawRequest,
      rawResponse,
      port,
      protocol
    }: {
      rawRequest: HTTP.IncomingMessage;
      rawResponse: HTTP.ServerResponse;
      port: number;
      protocol: Server.SupportedProtocols;
    }
  ): Promise<void> {

    Logger.logInfo({
      title: this.localization.notifications.newRequest.title,
      description: `${ rawRequest.method }::${ rawRequest.url }\n${ stringifyAndFormatArbitraryValue(rawRequest.headers) }`
    });

    /* [ Reference ] https://stackoverflow.com/q/68830792/4818123 */
    if (isUndefined(rawRequest.method)) {

      Logger.logError({
        errorType: UnsupportedScenarioError.NAME,
        title: UnsupportedScenarioError.localization.defaultTitle,
        description: this.localization.errors.HTTP_MethodIsNotDefined,
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
      });

      rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
      return;
    }


    if (!isElementOfEnumeration(rawRequest.method, HTTP_Methods)) {

      Logger.logError({
        errorType: UnsupportedScenarioError.NAME,
        title: UnsupportedScenarioError.localization.defaultTitle,
        description: this.localization.errors.invalidHTTP_Method({ HTTP_Method: rawRequest.method }),
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
      });

      rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
      return;
    }


    const HTTP_Method: HTTP_Methods = rawRequest.method;

    /* [ Reference ] https://stackoverflow.com/q/68830828/4818123 */
    if (isUndefined(rawRequest.url)) {

      Logger.logError({
        errorType: UnsupportedScenarioError.NAME,
        title: UnsupportedScenarioError.localization.defaultTitle,
        description: this.localization.errors.requestURL_IsNotDefined,
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
      });

      rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
      return;
    }


    let URI_PathAndQuery: string;

    try {

      URI_PathAndQuery = decodeURIComponent(rawRequest.url);

    } catch (error: unknown) {

      Logger.logError({
        errorType: "URI_DecodingError",
        title: "URI decoding error",
        description: this.localization.errors.URI_PathAndQueryDecodingError({ URI_PathAndQuery: rawRequest.url }),
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)",
        caughtError: error
      });

      rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
      return;
    }


    /* eslint-disable-next-line no-bitwise, no-implicit-coercion --
     * Here is bitwise operation is required and conscious. */
    if (~URI_PathAndQuery.indexOf("\0") !== 0) {

      Logger.logWarning({
        title: this.localization.notifications.nullBytePoisoningAttackAttemptDetected.title,
        description: this.localization.notifications.nullBytePoisoningAttackAttemptDetected.generateDescription({
          formattedHTTP_Headers: stringifyAndFormatArbitraryValue(rawRequest.headers)
        }),
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
      });

      rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
      return;
    }


    /* [ Theory ] If to rely on TypeScript type definitions, NodeJS will prevent arrayed "IP_Address" header. */
    const rawHostHTTP_Header: string | undefined = rawRequest.headers.host;

    if (isUndefined(rawHostHTTP_Header)) {

      /* [ Reference ] https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host */
      Logger.logError({
        errorType: "RequiredHTTP_HeaderMissingError",
        ...this.localization.errors.missingHostHTTP_Header,
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
      });

      rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
      return;
    }


    let parsedHostHTTP_Header: HostHTTP_HeaderParser.ParsedHostHTTP_Header;

    try {

      parsedHostHTTP_Header = HostHTTP_HeaderParser.parse(rawHostHTTP_Header, {
        defaultPortForActualProtocol: port,
        supportedBasicDomains: this.config.basicDomains
      });

    } catch (error: unknown) {

      Logger.logError({
        errorType: "HostHTTP_HeaderParsingFailedError",
        title: this.localization.errors.hostHTTP_HeaderParsingFailed.title,
        description: this.localization.errors.hostHTTP_HeaderParsingFailed.generateDescription({ rawHostHTTP_Header }),
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)",
        caughtError: error
      });

      rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
      return;
    }


    if (parsedHostHTTP_Header.port !== port) {

      Logger.logError({
        errorType: UnexpectedEventError.NAME,
        title: this.localization.errors.wrongPortNumberInHostHTTP_Header.title,
        description: this.localization.errors.wrongPortNumberInHostHTTP_Header.generateDescription({
          rightPortNumber: port,
          portNumberInHostHTTP_Header: parsedHostHTTP_Header.port
        }),
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)",
        additionalData: {
          rawHostHTTP_Header,
          parsedHostHeader: parsedHostHTTP_Header
        }
      });

      rawResponse.writeHead(HTTP_StatusCodes.internalServerError).end();
      return;
    }


    let targetDomain: string;
    let routingActualForTargetDomain: Router.NormalizedRouting;
    let publicDirectoriesAbsolutePathsActualForTargetDomain: Array<string>;

    if ("IP_Address" in parsedHostHTTP_Header) {

      targetDomain = parsedHostHTTP_Header.IP_Address;
      routingActualForTargetDomain = this.config.routing;
      publicDirectoriesAbsolutePathsActualForTargetDomain = this.config.publicDirectoriesAbsolutePaths;

    } else if (parsedHostHTTP_Header.subdomainsOfMainDomain.fromTopmostLevel.length === 0) {

      targetDomain = parsedHostHTTP_Header.domain;
      routingActualForTargetDomain = this.config.routing;
      publicDirectoriesAbsolutePathsActualForTargetDomain = this.config.publicDirectoriesAbsolutePaths;

    } else {

      targetDomain = parsedHostHTTP_Header.domain;

      const actualSubdomainConfig: Server.NormalizedConfig.Subdomains.ConfigMatch | null =
          getSubdomainConfig({
            subdomainsOfMainDomain__fromTopmostLevel: parsedHostHTTP_Header.subdomainsOfMainDomain.fromTopmostLevel,
            subdomainsNormalizedConfig: this.config.subdomains
          });

      if (isNull(actualSubdomainConfig)) {

        Logger.logError({
          errorType: "UnknownSubdomainError",
          title: this.localization.errors.unknownSubdomain.title,
          description: this.localization.errors.unknownSubdomain.generateDescription({
            requestedSubdomain: parsedHostHTTP_Header.domain
          }),
          occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
        });

        rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
        return;
      }


      routingActualForTargetDomain = actualSubdomainConfig.config.routing;
      publicDirectoriesAbsolutePathsActualForTargetDomain = actualSubdomainConfig.config.publicDirectoriesAbsolutePaths;
    }

    const normalizedURI: URL = new URL(
      URI_PathAndQuery, `${ protocol.toLocaleLowerCase() }://${ targetDomain }:${ port }/`
    );


    /* [ Theory ] The route matching should be executed before static file searching because the static files searching requires
     *     more computing resources. If user wants the public file, not route, in most cases the route resolution will end with
     *     'null' result quickly and minimal performance loss.  */
    const routeMatch: Router.RouteMatch | null = Router.getRouteMatch({
      HTTP_Method,
      URI_Path: normalizedURI.pathname,
      normalizedRouting: routingActualForTargetDomain
    });


    let processedRoutePathParameters: Router.RoutePathParameters | undefined;

    if (isNotNull(routeMatch) && isNotUndefined(routeMatch.routePathParameterProcessing)) {

      const routePathParametersProcessingResult: RawObjectDataProcessor.ProcessingResult<Router.RoutePathParameters> =
          RawObjectDataProcessor.process(
            routeMatch.routePathParameters,
            {
              nameForLogging: this.localization.errors.invalidRoutePathParameters.generateDataNameForDescription({
                targetURI: normalizedURI.toString()
              }),
              subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
              properties: routeMatch.routePathParameterProcessing
            }
          );

      if (routePathParametersProcessingResult.rawDataIsInvalid) {

        Logger.logError({
          errorType: "InvalidRoutePathParametersError",
          title: this.localization.errors.invalidRoutePathParameters.title,
          description: this.localization.errors.invalidRoutePathParameters.generateDescription({
            formattedPreIndentedValidationErrorsMessages: RawObjectDataProcessor.formatValidationErrorsList(
              routePathParametersProcessingResult.validationErrorsMessages
            )
          }),
          occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
        });


        rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
        return;
      }


      processedRoutePathParameters = routePathParametersProcessingResult.processedData;
    }


    const queryParametersDeserializer: URI_QueryParametersDeserializer = routeMatch?.routeQueryParametersDeserializer ??
        this.config.URI_QueryParametersMainDeserializer;

    /* [ Theory ] Basically, the parameters deserializer must remove the leading question mark, however working with third-party
    *     deserializer, it could not be guaranteed. */
    const deserializedURI_QueryParameters: ParsedJSON_Object = queryParametersDeserializer(
      removeSpecificCharacter({ targetString: normalizedURI.search, targetCharacter: "?", atFirstPosition: true })
    );

    let processedURI_QueryParameters: ParsedJSON_Object | undefined;

    if (isNotNull(routeMatch) && isNotUndefined(routeMatch.routeQueryParametersProcessing)) {

      const routeQueryParametersProcessingResult: RawObjectDataProcessor.ProcessingResult<Request.RoutePathParameters> =
          RawObjectDataProcessor.process(
            deserializedURI_QueryParameters,
            {
              nameForLogging: this.localization.errors.invalidRouteQueryParameters.generateDataNameForDescription({
                targetURI: normalizedURI.toString()
              }),
              subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
              properties: routeMatch.routeQueryParametersProcessing
            }
          );

      if (routeQueryParametersProcessingResult.rawDataIsInvalid) {

        Logger.logError({
          errorType: "InvalidURI_QueryParametersError",
          title: this.localization.errors.invalidRouteQueryParameters.title,
          description: this.localization.errors.invalidRouteQueryParameters.generateDescription({
            formattedPreIndentedValidationErrorsMessages: RawObjectDataProcessor.formatValidationErrorsList(
              routeQueryParametersProcessingResult.validationErrorsMessages
            )
          }),
          occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
        });

        rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
        return;
      }


      processedURI_QueryParameters = routeQueryParametersProcessingResult.processedData;
    }


    const localization: Localization = this.localization;
    const normalizedRequest: Request = {

      URI: normalizedURI,
      HTTP_Method,

      routePathParameters: routeMatch?.routePathParameters ?? {},
      ...isNotUndefined(processedRoutePathParameters) ? { $processedRoutePathParameters: processedRoutePathParameters } : null,
      getProcessedRoutePathParameters<
        ProcessedRootPathParameters extends Request.RoutePathProcessedParameters
      >(): ProcessedRootPathParameters {

        if (isUndefined(this.$processedRoutePathParameters)) {
          Logger.throwErrorAndLog({
            errorType: ImproperUsageError.NAME,
            ...localization.errors.unableToAccessToProcessedRoutePathParameters,
            occurrenceLocation: "request.getProcessedRoutePathParameters()"
          });
        }


        /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
        * Is this case casting is inevitable because we can not know at advance the exact schema of root path parameters
        * which will be defined by user. */
        return processedRoutePathParameters as ProcessedRootPathParameters;
      },

      ...isNotUndefined(processedURI_QueryParameters) ? { $processedQueryParameters: processedURI_QueryParameters } : null,
      getProcessedQueryParameters<ProcessedURI_QueryParameters extends ParsedJSON_Object>(): ProcessedURI_QueryParameters {

        if (isUndefined(this.$processedQueryParameters)) {
          Logger.throwErrorAndLog({
            errorType: ImproperUsageError.NAME,
            ...localization.errors.unableToAccessToProcessedRouteQueryParameters,
            occurrenceLocation: "request.getProcessedQueryParameters()"
          });
        }


        /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
         * Is this case casting is inevitable because we can not know at advance the exact schema of query path parameters
         * which will be defined by user. */
        return processedURI_QueryParameters as ProcessedURI_QueryParameters;
      }
    };


    const response: Response = new Response(rawResponse);

    for (const middleware of this.middlewareHandlers) {

      let middlewareCompletionSignal: Middleware.CompletionSignal;

      try {

        /* eslint-disable-next-line no-await-in-loop --
         * The middleware handlers must be executed sequentially. */
        middlewareCompletionSignal = await middleware(normalizedRequest, response, this.config);

      } catch (error: unknown) {

        Logger.logError({
          errorType: "MiddlewareExecutionError",
          ...this.localization.errors.middlewareExecutionFailed,
          occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)",
          caughtError: error
        });

        return response.submitWithError({ statusCode: ServerErrorsHTTP_StatusCodes.internalServerError });
      }


      if (middlewareCompletionSignal === Middleware.CompletionSignal.finishRequestHandling) {
        return;
      }
    }


    if (isNotNull(routeMatch)) {

      try {

        await routeMatch.handler(normalizedRequest, response);

      } catch (error: unknown) {

        Logger.logError({
          errorType: "RouterHandlerExecutionError",
          ...this.localization.errors.routeHandlerExecutionFailed,
          occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)",
          caughtError: error
        });

        return response.submitWithError({ statusCode: ServerErrorsHTTP_StatusCodes.internalServerError });
      }


      return;
    }


    const potentialRawRelatedPathToPublicFile: string = normalizedURI.pathname;
    const potentialNormalizedRelatedPathToPublicFile: string = Path.normalize(potentialRawRelatedPathToPublicFile);
    const potentialNormalizedAbsolutePathsToPublicFile: Array<string> = publicDirectoriesAbsolutePathsActualForTargetDomain.map(
      (publicDirectoryAbsolutePath: string): string => Path.join(
        publicDirectoryAbsolutePath, potentialNormalizedRelatedPathToPublicFile
      )
    );

    if (potentialRawRelatedPathToPublicFile.includes("../")) {
      Logger.logWarning({
        title: this.localization.notifications.directoryTraversalAttackSuspected.title,
        description:
            this.localization.notifications.directoryTraversalAttackSuspected.generateDescription({
              potentialRawRelatedPathToPublicFile,
              formattedPotentialNormalizedAbsolutePathsToPublicFile: stringifyAndFormatArbitraryValue(
                potentialNormalizedAbsolutePathsToPublicFile
              ),
              formattedHTTP_RequestHeaders: stringifyAndFormatArbitraryValue(rawRequest.headers)
            }),
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
      });
    }

    let validAbsolutePathToPublicFile: string | undefined;

    for (const publicDirectoryAbsolutePath of publicDirectoriesAbsolutePathsActualForTargetDomain) {

      const potentialNormalizedAbsolutePathToPublicFile: string = Path.join(
        publicDirectoryAbsolutePath, potentialNormalizedRelatedPathToPublicFile
      );

      if (potentialNormalizedAbsolutePathToPublicFile.startsWith(publicDirectoryAbsolutePath)) {
        validAbsolutePathToPublicFile = potentialNormalizedAbsolutePathToPublicFile;
        break;
      }
    }

    if (isUndefined(validAbsolutePathToPublicFile)) {

      if (normalizedRequest.URI.pathname === "/favicon.ico") {
        sendFileByStreams(Path.join(__dirname, "..", "..", "favicon.ico"), response);
        return;
      }


      Logger.logError({
        errorType: "RequestedResourceNotFoundError",
        title: this.localization.errors.requestedResourceNotFound.title,
        description: this.localization.errors.requestedResourceNotFound.generateDescription({
          potentialRawRelatedPathToPublicFile
        }),
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
      });

      rawResponse.writeHead(HTTP_StatusCodes.notFound).end();
      return;
    }


    let targetFileStatistics: FileSystem.Stats;

    try {

      targetFileStatistics = await PromisfiedFileSystem.stat(validAbsolutePathToPublicFile);

    } catch (error: unknown) {

      if (isErrnoException(error) && error.code === "ENOENT") {
        rawResponse.writeHead(HTTP_StatusCodes.notFound).end();
        return;
      }


      Logger.logError({
        errorType: UnexpectedEventError.NAME,
        title: UnexpectedEventError.localization.defaultTitle,
        description: this.localization.errors.fileStatisticsRetrievingFailure,
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)",
        caughtError: error
      });

      rawResponse.writeHead(HTTP_StatusCodes.internalServerError).end();
      return;
    }


    if (!targetFileStatistics.isFile()) {

      Logger.logWarning({
        title: this.localization.errors.directoryInsteadOfFileHasBeenRequested.title,
        description: this.localization.errors.directoryInsteadOfFileHasBeenRequested.generateDescription({
          targetPath: validAbsolutePathToPublicFile
        }),
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
      });

      rawResponse.writeHead(HTTP_StatusCodes.notFound).end();
      return;
    }


    sendFileByStreams(validAbsolutePathToPublicFile, response);
  }


  private inspectSpecifiedBasicDomains(): Array<Promise<void>> {
    return this.config.basicDomains.map(async (domain: string): Promise<void> => {

      /* [ Theory ] "DomainNameSystem.resolve()" could hang up it "localhost" is the parameter. */
      if (domain === "localhost") {
        return;
      }


      return DomainNameSystem.resolve(domain).

          then((IP_Addresses: Array<string>): void => {

            if (!IP_Addresses.includes(this.config.IP_Address)) {

              Logger.logError({
                errorType: InvalidConfigError.NAME,
                title: InvalidConfigError.localization.defaultTitle,
                description: InvalidConfigError.localization.generateDescription({
                  mentionToConfig: "Yamato Daiwa Backend (YDB)",
                  messageSpecificPart: this.localization.errors.IP_AddressDoesNotMatchWithSpecifiedDomain.generateDescription({
                    domain, IP_Address: this.config.IP_Address
                  })
                }),
                occurrenceLocation: "server.inspectSpecifiedBasicDomains()"
              });

              removeArrayElementsByPredicates({
                targetArray: this.config.basicDomains,
                predicate: (supportedBasicDomain: string): boolean => supportedBasicDomain !== domain,
                mutably: true
              });
            }
          }).

          catch((error: unknown): void => {

            if (isErrnoException(error) && error.code === "ENOTFOUND") {
              Logger.logError({
                errorType: InvalidConfigError.NAME,
                title: InvalidConfigError.localization.defaultTitle,
                description: InvalidConfigError.localization.generateDescription({
                  mentionToConfig: "Yamato Daiwa Backend (YDB)",
                  messageSpecificPart: this.localization.errors.IP_AddressDoesNotMatchWithSpecifiedDomain.generateDescription({
                    domain, IP_Address: this.config.IP_Address
                  })
                }),
                occurrenceLocation: "server.inspectSpecifiedBasicDomains()",
                caughtError: error
              });
            } else {
              Logger.logError({
                errorType: UnexpectedEventError.NAME,
                title: UnexpectedEventError.localization.defaultTitle,
                description: `The unexpected error occurred during validating of domain '${ domain }'. We are sorry, ` +
                    "but for the preventing of unexpected bugs we have to exclude this domain from basic domains array.",
                occurrenceLocation: "server.inspectSpecifiedBasicDomains()",
                caughtError: error
              });
            }

            removeArrayElementsByPredicates({
              targetArray: this.config.basicDomains,
              predicate: (supportedBasicDomain: string): boolean => supportedBasicDomain !== domain,
              mutably: true
            });
          });
    });
  }


  static {
    Logger.setImplementation(ConsoleApplicationLogger);
  }
}


namespace Server {

  export type RawConfig = {
    readonly IP_Address: string;
    readonly basicDomains?: ReadonlyArray<string>;
    readonly HTTP?: RawConfig.HTTP;
    readonly HTTPS?: RawConfig.HTTPS;
    readonly routing?: Router.RawRouting;
    readonly publicDirectoriesAbsoluteOrRelativePaths?: ReadonlyArray<string>;
    readonly subdomains?: RawConfig.Subdomains;
    readonly URI_QueryParametersMainDeserializer?: URI_QueryParametersDeserializer;
  };

  export namespace RawConfig {

    export type HTTP = {
      readonly port: number;
    };

    export type HTTPS = {
      readonly port: number;
      readonly SSL_KeyFileRelativeOrAbsolutePath: string;
      readonly SSL_CertificateFileRelativeOrAbsolutePath: string;
    };

    export type Subdomains = { readonly [subdomainPattern: string]: Subdomain; };

    export type Subdomain = {
      readonly parameters?: { readonly [parameterName: string]: { readonly allowedAlternatives: ReadonlyArray<string>; }; };
      readonly routing: Router.RawRouting;
      readonly publicDirectoriesAbsoluteOrRelativePaths?: ReadonlyArray<string>;
    };
  }

  export enum SupportedProtocols {
    /* eslint-disable-next-line @typescript-eslint/no-shadow --
     * The declaring of type/interface inside namespace with same name as defined in upper scope
     * is completely valid TypeScript and not desired to be warned by @typescript-eslint. */
    HTTP = "HTTP",
    /* eslint-disable-next-line @typescript-eslint/no-shadow --
     * The declaring of type/interface inside namespace with same name as defined in upper scope
     * is completely valid TypeScript and not desired to be warned by @typescript-eslint. */
    HTTPS = "HTTPS"
  }

  export type NormalizedConfig = {
    readonly IP_Address: string;
    readonly basicDomains: Array<string>;
    readonly HTTP?: NormalizedConfig.HTTP;
    readonly HTTPS?: NormalizedConfig.HTTPS;
    readonly routing: Router.NormalizedRouting;
    readonly publicDirectoriesAbsolutePaths: Array<string>;
    readonly subdomains?: NormalizedConfig.Subdomains;
    readonly URI_QueryParametersMainDeserializer: URI_QueryParametersDeserializer;
  };

  export namespace NormalizedConfig {

    /* [ Theory ] According  RFC6454, the origin is scheme+host+port https://stackoverflow.com/a/37366696/4818123 */
    export type HTTP = {

      readonly IP_AddressBasedMainOrigin: string;

      /* [ Theory ] First, it could not be. Second, it could be computed only asynchronously.
       *    We can check the IP address by domain, but basically the checking of domain by IP address by domain is impossible. */
      readonly domainNameBasedMainOrigin?: string;
      readonly port: number;
    };

    export type HTTPS = {
      readonly IP_AddressBasedMainOrigin: string;

      /* [ Theory ] First, it could not be. Second, it could be computed only asynchronously.
      *    We can check the IP address by domain, but basically the checking of domain by IP address by domain is impossible. */
      readonly domainNameBasedMainOrigin?: string;
      readonly port: number;
      readonly SSL_KeyFileAbsolutePath: string;
      readonly SSL_CertificateFileAbsolutePath: string;
    };

    export type Subdomains = Subdomains.TreeNodes;

    export type Subdomain = {
      readonly routing: Router.NormalizedRouting;
      readonly publicDirectoriesAbsolutePaths: Array<string>;
    };

    export namespace Subdomains {

      export type TreeNodes = {
        staticLabels: StaticLabelsNodes;
        dynamicLabel?: DynamicLabelNode;
      };

      export type StaticLabelsNodes = { [labelName: string]: StaticLabelNode | undefined; };

      export type StaticLabelNode = {
        match?: Subdomain;
        children: TreeNodes;
      };

      export type DynamicLabelNode = {
        name: string;
        match?: Subdomain;
        children: TreeNodes;
      };

      export type ConfigMatch = {
        config: Subdomain;
        parameterizedHostNameLabels_Values: ParameterizedHostNameLabels;
      };

      export type ParameterizedHostNameLabels = { [parameterName: string]: string | undefined; };
    }
  }
}


export default Server;
