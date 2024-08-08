/* ─── Native Modules ─────────────────────────────────────────────────────────────────────────────────────────────── */
import HTTP from "http";
import HTTPS from "https";
import type FileSystem from "fs";
import PromisfiedFileSystem from "fs/promises";
import Path from "path";
import DomainNameSystem from "dns/promises";

/* ─── Framework's Constituents ───────────────────────────────────────────────────────────────────────────────────── */
import type Request from "../Request";
import Response from "../Response/Response";
import Router from "../Router";
import Middleware from "../Middleware/Middleware";
import type URI_QueryParametersDeserializer from "../URI_QueryParametersDeserializer";

/* ─── Build-in Middlewares ───────────────────────────────────────────────────────────────────────────────────────── */
import CORS_Middleware from "../Middleware/CORS_Middleware";

/* ─── Applied Utils ──────────────────────────────────────────────────────────────────────────────────────────────── */
import ConfigurationNormalizer from "../ConfigurationNormalizer/ConfigurationNormalizer";
import HostHTTP_HeaderParser from "../Utils/HostHTTP_HeaderParser";
import getSubdomainConfig from "../Utils/getSubdomainConfig";

/* ─── General Utils ──────────────────────────────────────────────────────────────────────────────────────────────── */
import {
  HTTP_StatusCodes,
  HTTP_Methods,
  RawObjectDataProcessor,
  Logger,
  UnsupportedScenarioError,
  UnexpectedEventError,
  InvalidConfigError,
  ImproperUsageError,
  DataSubmittingFailedError,
  ServerErrorsHTTP_StatusCodes,
  isUndefined,
  isElementOfEnumeration,
  isNotNull,
  stringifyAndFormatArbitraryValue,
  isNull,
  isNotUndefined,
  removeArrayElementsByPredicates,
  removeSpecificCharacterFromCertainPosition,
  type Log,
  type ParsedJSON_Object
} from "@yamato-daiwa/es-extensions";
import {
  ConsoleApplicationLogger,
  isErrnoException
} from "@yamato-daiwa/es-extensions-nodejs";

/* ─── Localization ───────────────────────────────────────────────────────────────────────────────────────────────── */
import serverLocalization__english from "./ServerLocalization.english";
import parseCookieHTTP_Header from "../Utils/parseCookieHTTP_Header";


class Server {

  public static localization: Server.Localization = serverLocalization__english;


  static {
    Logger.setImplementation(ConsoleApplicationLogger);
  }


  /* ━━━ Instance Fields ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  private readonly configuration: Server.NormalizedConfiguration;
  private readonly middlewares: Array<Middleware> = [ CORS_Middleware ];


  /* ━━━ Public Static Methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  public static initializeAndStart(configuration: Server.RawConfiguration): Server {
    return new Server(configuration).start();
  }

  public static initialize(configuration: Server.RawConfiguration): Server {
    return new Server(configuration);
  }


  /* ━━━ Constructor ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  private constructor(configuration: Server.RawConfiguration) {
    this.configuration = ConfigurationNormalizer.normalize(configuration);
  }


  /* ━━━ Public Instance Methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  public start(): this {

    Promise.all(this.inspectSpecifiedBasicDomains()).

        then((): void => {
          this.startHTTP_RequestServingIfCorrespondingConfigurationDefined();
          this.startHTTPS_RequestServingIfCorrespondingConfigurationDefined();
        }).

        catch((error: unknown): void => {
          Logger.logError({
            errorType: "ServerStartingFailed",
            ...Server.localization.errors.serverStartingFailed,
            occurrenceLocation: "Server.start()",
            caughtError: error
          });
        });

    return this;

  }


  /* ━━━ Private Methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  private startHTTP_RequestServingIfCorrespondingConfigurationDefined(): void {

    if (isUndefined(this.configuration.HTTP)) {
      return;
    }


    const HTTP_Configuration: Server.NormalizedConfiguration.HTTP = this.configuration.HTTP;

    HTTP.

        createServer(
          (rawRequest: HTTP.IncomingMessage, rawResponse: HTTP.ServerResponse): void => {

            this.requestMasterHandler({
              rawRequest,
              rawResponse,
              protocol: Server.SupportedProtocols.HTTP,
              port: HTTP_Configuration.port
            }).

                catch((error: unknown): void => {

                  Logger.logError({
                    errorType: UnexpectedEventError.NAME,
                    title: UnexpectedEventError.localization.defaultTitle,
                    description: Server.localization.errors.requestMasterListenerDidNotCatchAllErrors,
                    occurrenceLocation: "server.startHTTP_RequestServingIfCorrespondingConfigurationDefined()",
                    caughtError: error
                  });

                  rawResponse.writeHead(HTTP_StatusCodes.internalServerError).end();

                });

          }
        ).

        listen(HTTP_Configuration.port, this.configuration.IP_Address, (): void => {
          Logger.logSuccess({
            title: Server.localization.notifications.HTTP_RequestsServingStarted.title,
            description: Server.localization.notifications.HTTP_RequestsServingStarted.generateDescription({
              IP_Address: this.configuration.IP_Address,
              HTTP_Port: HTTP_Configuration.port
            })
          });
        }).

        on("error", (error: Error): void => {
          Logger.logError({
            errorType: "HTTP_RequestsServingBootstrapError",
            ...Server.localization.errors.HTTP_RequestsServingBootstrapError,
            occurrenceLocation: "server.startHTTP_RequestServingIfCorrespondingConfigurationDefined()",
            caughtError: error
          });
        });

  }

  private startHTTPS_RequestServingIfCorrespondingConfigurationDefined(): void {

    if (isUndefined(this.configuration.HTTPS)) {
      return;
    }


    const HTTPS_Config: Server.NormalizedConfiguration.HTTPS = this.configuration.HTTPS;

    HTTPS.

        createServer(
          {
            key: HTTPS_Config.SSL_Key,
            cert: HTTPS_Config.SSL_Certificate
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
                    description: Server.localization.errors.requestMasterListenerDidNotCatchAllErrors,
                    occurrenceLocation: "server.startHTTPS_RequestServingIfCorrespondingConfigurationDefined()",
                    caughtError: error
                  });

                  rawResponse.writeHead(HTTP_StatusCodes.internalServerError).end();
                });

          }
        ).

        listen(HTTPS_Config.port, this.configuration.IP_Address, (): void => {
          Logger.logSuccess({
            title: Server.localization.notifications.HTTPS_RequestsServingStarted.title,
            description: Server.localization.notifications.HTTPS_RequestsServingStarted.generateDescription({
              IP_Address: this.configuration.IP_Address,
              HTTPS_Port: HTTPS_Config.port
            })
          });
        }).

        on("error", (error: Error): void => {
          Logger.logError({
            errorType: "HTTPS_RequestsServingBootstrapError",
            ...Server.localization.errors.HTTP_RequestsServingBootstrapError,
            occurrenceLocation: "server.startHTTPS_RequestServingIfCorrespondingConfigurationDefined()",
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
      title: Server.localization.notifications.newRequest,
      description: `${ rawRequest.method }::${ rawRequest.url }\n${ stringifyAndFormatArbitraryValue(rawRequest.headers) }`
    });

    /* [ Reference ] https://stackoverflow.com/q/68830792/4818123 */
    if (isUndefined(rawRequest.method)) {

      Logger.logError({
        errorType: UnsupportedScenarioError.NAME,
        title: UnsupportedScenarioError.localization.defaultTitle,
        description: Server.localization.errors.HTTP_MethodIsNotDefined,
        occurrenceLocation: "Server.requestMasterHandler(compoundParameter)"
      });

      rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
      return;

    }


    if (!isElementOfEnumeration(rawRequest.method, HTTP_Methods)) {

      Logger.logError({
        errorType: UnsupportedScenarioError.NAME,
        title: UnsupportedScenarioError.localization.defaultTitle,
        description: Server.localization.errors.unsupportedHTTP_Method.generateMessage({ HTTP_Method: rawRequest.method }),
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
        description: Server.localization.errors.requestURL_IsNotDefined,
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
        description: Server.localization.errors.URI_PathAndQueryDecoding.
            generateMessage({ URI_PathAndQuery: rawRequest.url }),
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
        title: Server.localization.notifications.nullBytePoisoningAttackAttemptDetected.title,
        description: Server.localization.notifications.nullBytePoisoningAttackAttemptDetected.generateDescription({
          formattedHTTP_Headers: stringifyAndFormatArbitraryValue(rawRequest.headers)
        }),
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
      });

      rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
      return;

    }


    /* [ Theory ] If to rely on TypeScript type definitions, Node.js will prevent arrayed "IP_Address" header. */
    const rawHostHTTP_Header: string | undefined = rawRequest.headers.host;

    if (isUndefined(rawHostHTTP_Header)) {

      /* [ Reference ] https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host */
      Logger.logError({
        errorType: "RequiredHTTP_HeaderMissingError",
        ...Server.localization.errors.missingHostHTTP_Header,
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
      });

      rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
      return;

    }


    let parsedHostHTTP_Header: HostHTTP_HeaderParser.ParsedHostHTTP_Header;

    try {

      parsedHostHTTP_Header = HostHTTP_HeaderParser.parse(rawHostHTTP_Header, {
        defaultPortForActualProtocol: port,
        supportedBasicDomains: this.configuration.basicDomains
      });

    } catch (error: unknown) {

      Logger.logError({
        errorType: "HostHTTP_HeaderParsingFailedError",
        title: Server.localization.errors.hostHTTP_HeaderParsingFailed.title,
        description: Server.localization.errors.hostHTTP_HeaderParsingFailed.generateDescription({ rawHostHTTP_Header }),
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)",
        caughtError: error
      });

      rawResponse.writeHead(HTTP_StatusCodes.badRequest).end();
      return;

    }


    if (parsedHostHTTP_Header.port !== port) {

      Logger.logError({
        errorType: UnexpectedEventError.NAME,
        title: Server.localization.errors.wrongPortNumberInHostHTTP_Header.title,
        description: Server.localization.errors.wrongPortNumberInHostHTTP_Header.generateDescription({
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
    let actualSubdomainConfig: Server.NormalizedConfiguration.Subdomains.ConfigMatch | null = null;

    if ("IP_Address" in parsedHostHTTP_Header) {

      targetDomain = parsedHostHTTP_Header.IP_Address;
      routingActualForTargetDomain = this.configuration.routing;
      publicDirectoriesAbsolutePathsActualForTargetDomain = this.configuration.publicDirectoriesAbsolutePaths;

    } else if (parsedHostHTTP_Header.subdomainsOfMainDomain.fromTopmostLevel.length === 0) {

      targetDomain = parsedHostHTTP_Header.domain;
      routingActualForTargetDomain = this.configuration.routing;
      publicDirectoriesAbsolutePathsActualForTargetDomain = this.configuration.publicDirectoriesAbsolutePaths;

    } else {

      targetDomain = parsedHostHTTP_Header.domain;

      actualSubdomainConfig = getSubdomainConfig({
        subdomainsOfMainDomain__fromTopmostLevel: parsedHostHTTP_Header.subdomainsOfMainDomain.fromTopmostLevel,
        subdomainsNormalizedConfig: this.configuration.subdomains
      });

      if (isNull(actualSubdomainConfig)) {

        Logger.logError({
          errorType: "UnknownSubdomainError",
          title: Server.localization.errors.unknownSubdomain.title,
          description: Server.localization.errors.unknownSubdomain.generateDescription({
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
      URI_PathAndQuery, `${ protocol.toLowerCase() }://${ targetDomain }:${ port }/`
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
              nameForLogging: Server.localization.errors.invalidRoutePathParameters.generateDataNameForDescription({
                targetURI: normalizedURI.toString()
              }),
              subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
              properties: routeMatch.routePathParameterProcessing
            }
          );

      if (routePathParametersProcessingResult.rawDataIsInvalid) {

        Logger.logError({
          errorType: "InvalidRoutePathParametersError",
          title: Server.localization.errors.invalidRoutePathParameters.title,
          description: Server.localization.errors.invalidRoutePathParameters.generateDescription({
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
        this.configuration.URI_QueryParametersMainDeserializer;

    /* [ Theory ] Basically, the parameters deserializer must remove the leading question mark, however working with third-party
    *     deserializer, it could not be guaranteed. */
    const deserializedURI_QueryParameters: ParsedJSON_Object = queryParametersDeserializer(
      removeSpecificCharacterFromCertainPosition({
        targetString: normalizedURI.search,
        targetCharacter: "?",
        fromFirstPosition: true
      })
    );

    let processedURI_QueryParameters: ParsedJSON_Object | undefined;

    if (isNotNull(routeMatch) && isNotUndefined(routeMatch.routeQueryParametersProcessing)) {

      const routeQueryParametersProcessingResult: RawObjectDataProcessor.ProcessingResult<Request.RoutePathParameters> =
          RawObjectDataProcessor.process(
            deserializedURI_QueryParameters,
            {
              nameForLogging: Server.localization.errors.invalidRouteQueryParameters.generateDataNameForDescription({
                targetURI: normalizedURI.toString()
              }),
              subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
              properties: routeMatch.routeQueryParametersProcessing
            }
          );

      if (routeQueryParametersProcessingResult.rawDataIsInvalid) {

        Logger.logError({
          errorType: "InvalidURI_QueryParametersError",
          title: Server.localization.errors.invalidRouteQueryParameters.title,
          description: Server.localization.errors.invalidRouteQueryParameters.generateDescription({
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


    const normalizedRequest: Request = {

      URI: normalizedURI,
      HTTP_Method,

      parsedCookies: isNotUndefined(rawRequest.headers.cookie) ?
          parseCookieHTTP_Header(rawRequest.headers.cookie) : new Map<string, string>(),

      routePathParameters: routeMatch?.routePathParameters ?? {},
      ...isNotUndefined(processedRoutePathParameters) ? { $processedRoutePathParameters: processedRoutePathParameters } : null,
      getProcessedRoutePathParameters<
        ProcessedRootPathParameters extends Request.RoutePathProcessedParameters
      >(): ProcessedRootPathParameters {

        if (isUndefined(this.$processedRoutePathParameters)) {
          Logger.throwErrorAndLog({
            errorType: ImproperUsageError.NAME,
            ...Server.localization.errors.unableToAccessToProcessedRoutePathParameters,
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
            ...Server.localization.errors.unableToAccessToProcessedRouteQueryParameters,
            occurrenceLocation: "request.getProcessedQueryParameters()"
          });
        }


        /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
         * Is this case casting is inevitable because we can not know at advance the exact schema of query path parameters
         * which will be defined by user. */
        return processedURI_QueryParameters as ProcessedURI_QueryParameters;

      },

      subdomainParameters: {
        ...isNotNull(actualSubdomainConfig) ? actualSubdomainConfig.parameterizedHostNameLabels_Values : null
      }

    };

    const response: Response = new Response(rawResponse, this.configuration);

    for (const middleware of this.middlewares) {

      let middlewareCompletionSignal: Middleware.CompletionSignal;

      try {

        /* eslint-disable-next-line no-await-in-loop --
         * The middleware handlers must be executed sequentially. */
        middlewareCompletionSignal = await middleware(normalizedRequest, response, this.configuration);

      } catch (error: unknown) {

        Logger.logError({
          errorType: "MiddlewareExecutionError",
          ...Server.localization.errors.middlewareExecutionFailed,
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
          ...Server.localization.errors.routeHandlerExecutionFailed,
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
        title: Server.localization.notifications.directoryTraversalAttackSuspected.title,
        description:
            Server.localization.notifications.directoryTraversalAttackSuspected.generateDescription({
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
        return response.submitWithSuccess({ filePath: Path.join(__dirname, "..", "..", "favicon.ico") });
      }


      Logger.logError({
        errorType: "RequestedResourceNotFoundError",
        title: Server.localization.errors.requestedResourceNotFound.title,
        description: Server.localization.errors.requestedResourceNotFound.generateDescription({
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
        description: Server.localization.errors.fileStatisticsRetrievingFailure,
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)",
        caughtError: error
      });

      rawResponse.writeHead(HTTP_StatusCodes.internalServerError).end();
      return;

    }


    if (!targetFileStatistics.isFile()) {

      Logger.logWarning({
        title: Server.localization.errors.directoryInsteadOfFileHasBeenRequested.title,
        description: Server.localization.errors.directoryInsteadOfFileHasBeenRequested.generateDescription({
          targetPath: validAbsolutePathToPublicFile
        }),
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)"
      });

      rawResponse.writeHead(HTTP_StatusCodes.notFound).end();
      return;

    }

    try {

      await response.submitWithSuccess({ filePath: validAbsolutePathToPublicFile });

    } catch (error: unknown) {

      Logger.logError({
        errorType: DataSubmittingFailedError.NAME,
        title: Server.localization.errors.publicFileSubmittingFailed.title,
        description: Server.localization.errors.publicFileSubmittingFailed.generateDescription({
          targetPath: validAbsolutePathToPublicFile
        }),
        occurrenceLocation: "Server.requestMasterHandler(rawRequest, rawResponse)",
        caughtError: error
      });

      rawResponse.writeHead(HTTP_StatusCodes.internalServerError).end();

    }
  }


  private inspectSpecifiedBasicDomains(): Array<Promise<void>> {
    return this.configuration.basicDomains.map(async (domain: string): Promise<void> => {

      /* [ Theory ] "DomainNameSystem.resolve()" could hang up it "localhost" is the parameter. */
      if (domain === "localhost") {
        return;
      }


      return DomainNameSystem.resolve(domain).

          then((IP_Addresses: Array<string>): void => {

            if (!IP_Addresses.includes(this.configuration.IP_Address)) {

              Logger.logError({
                errorType: InvalidConfigError.NAME,
                title: InvalidConfigError.localization.defaultTitle,
                description: InvalidConfigError.localization.generateDescription({
                  mentionToConfig: "Yamato Daiwa Backend (YDB)",
                  messageSpecificPart: Server.localization.errors.IP_AddressDoesNotMatchWithSpecifiedDomain.generateDescription({
                    domain, IP_Address: this.configuration.IP_Address
                  })
                }),
                occurrenceLocation: "server.inspectSpecifiedBasicDomains()"
              });

              removeArrayElementsByPredicates({
                targetArray: this.configuration.basicDomains,
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
                  messageSpecificPart: Server.localization.errors.IP_AddressDoesNotMatchWithSpecifiedDomain.
                    generateDescription({ domain, IP_Address: this.configuration.IP_Address })
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
              targetArray: this.configuration.basicDomains,
              predicate: (supportedBasicDomain: string): boolean => supportedBasicDomain !== domain,
              mutably: true
            });

          });

    });
  }

}


namespace Server {

  export type Security = Readonly<{
    HTTP_Headers: Security.HTTP_Headers;
  }>;

  export namespace Security {
    export type HTTP_Headers = Readonly<{
      crossOriginOpenerPolicy: "unsafe-none" | "same-origin-allow-popups" | "same-origin";
      crossOriginResourcePolicy: "cross-origin" | "same-origin" | "same-site";
      originAgentCluster: boolean;
    }>;
  }

  export type RawConfiguration = Readonly<{
    IP_Address: string;
    basicDomains?: ReadonlyArray<string>;
    HTTP?: RawConfiguration.HTTP;
    HTTPS?: RawConfiguration.HTTPS;
    routing?: Router.RawRouting;
    publicDirectoriesAbsoluteOrRelativePaths?: ReadonlyArray<string>;
    security?: RawConfiguration.Security;
    subdomains?: RawConfiguration.Subdomains;
    URI_QueryParametersMainDeserializer?: URI_QueryParametersDeserializer;
  }>;

  export namespace RawConfiguration {

    export type HTTP = Readonly<{
      port: number;
    }>;

    export type HTTPS =

        Readonly<{ port: number; }> &

        Readonly<(
          { SSL_KeyFileRelativeOrAbsolutePath: string; } |
          { SSL_Key: string; }
        )> &

        Readonly<(
          { SSL_CertificateFileRelativeOrAbsolutePath: string; } |
          { SSL_Certificate: string; }
        )>;

    /* eslint-disable-next-line @typescript-eslint/no-shadow -- No problems if to access by fully qualified name. */
    export type Security = Readonly<{
      HTTP_Headers?: Security.HTTP_Headers;
    }>;

    export namespace Security {
      export type HTTP_Headers = Partial<Server.Security.HTTP_Headers>;
    }

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

  export type NormalizedConfiguration = Readonly<{
    security: Security;
    IP_Address: string;
    basicDomains: Array<string>;
    HTTP?: NormalizedConfiguration.HTTP;
    HTTPS?: NormalizedConfiguration.HTTPS;
    routing: Router.NormalizedRouting;
    publicDirectoriesAbsolutePaths: Array<string>;
    subdomains?: NormalizedConfiguration.Subdomains;
    URI_QueryParametersMainDeserializer: URI_QueryParametersDeserializer;
  }>;

  export namespace NormalizedConfiguration {

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
      readonly SSL_Key: string;
      readonly SSL_Certificate: string;
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


  /* ━━━ Localization ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  export type Localization = Readonly<{

    errors: Readonly<{

      IP_AddressDoesNotMatchWithSpecifiedDomain: Readonly<{
        generateDescription: (
          templateVariables: Localization.Errors.IP_AddressDoesNotMatchWithSpecifiedDomain.TemplateVariables
        ) => string;
      }>;

      domainValidationMalfunction: Readonly<{
        generateMessage: (
          templateVariables: Localization.Errors.DomainValidationMalfunction.TemplateVariables
        ) => string;
      }>;

      serverStartingFailed: Pick<Log, "title" | "description">;

      requestMasterListenerDidNotCatchAllErrors: string;

      HTTP_RequestsServingBootstrapError: Pick<Log, "title" | "description">;

      HTTPS_RequestsServingBootstrapError: Pick<Log, "title" | "description">;

      HTTP_MethodIsNotDefined: string;

      unsupportedHTTP_Method: Readonly<{
        generateMessage: (
          templateVariables: Localization.Errors.InvalidHTTP_Method.TemplateVariables
        ) => string;
      }>;

      requestURL_IsNotDefined: string;

      URI_PathAndQueryDecoding: Readonly<{
        generateMessage: (
          templateVariables: Localization.Errors.URI_PathAndQueryDecoding.TemplateVariables
        ) => string;
      }>;

      missingHostHTTP_Header: Pick<Log, "title" | "description">;

      hostHTTP_HeaderParsingFailed: Readonly<{
        title: string;
        generateDescription: (
          templateVariables: Localization.Errors.HostHTTP_HeaderParsingFailed.TemplateVariables
        ) => string;
      }>;

      wrongPortNumberInHostHTTP_Header: Readonly<{
        title: string;
        generateDescription: (
          templateVariables: Localization.Errors.WrongPortNumberInHostHTTP_Header.TemplateVariables
        ) => string;
      }>;

      unknownSubdomain: Readonly<{
        title: string;
        generateDescription: (
          templateVariables: Localization.Errors.UnknownSubdomain.TemplateVariables
        ) => string;
      }>;

      invalidRoutePathParameters: Readonly<{
        title: string;
        generateDataNameForDescription: (
          templateVariables: Localization.Errors.InvalidRoutePathParameters.DataName.TemplateVariables
        ) => string;
        generateDescription: (
          templateVariables: Localization.Errors.InvalidRoutePathParameters.Description.TemplateVariables
        ) => string;
      }>;

      invalidRouteQueryParameters: Readonly<{
        title: string;
        generateDataNameForDescription: (
          templateVariables: Localization.Errors.InvalidRouteQueryParameters.DataName.TemplateVariables
        ) => string;
        generateDescription: (
          templateVariables: Localization.Errors.InvalidRouteQueryParameters.Description.TemplateVariables
        ) => string;
      }>;

      unableToAccessToProcessedRoutePathParameters: Pick<Log, "title" | "description">;

      unableToAccessToProcessedRouteQueryParameters: Pick<Log, "title" | "description">;

      middlewareExecutionFailed: Pick<Log, "title" | "description">;

      routeHandlerExecutionFailed: Pick<Log, "title" | "description">;

      requestedResourceNotFound: Readonly<{
        title: string;
        generateDescription: (
          templateVariables: Localization.Errors.RequestedResourceNotFound.TemplateVariables
        ) => string;
      }>;

      fileStatisticsRetrievingFailure: string;

      directoryInsteadOfFileHasBeenRequested: Readonly<{
        title: string;
        generateDescription: (
          templateVariables: Localization.Errors.DirectoryInsteadOfFileHasBeenRequested.TemplateVariables
        ) => string;
      }>;

      publicFileSubmittingFailed: Readonly<{
        title: string;
        generateDescription: (
          templateVariables: Localization.Errors.PublicFileSubmittingFailed.TemplateVariables
        ) => string;
      }>;

    }>;

    notifications: Readonly<{

      HTTP_RequestsServingStarted: Readonly<{
        title: string;
        generateDescription: (
          templateVariables: Localization.Notifications.HTTP_RequestsServiceStarted.TemplateVariables
        ) => string;
      }>;

      HTTPS_RequestsServingStarted: Readonly<{
        title: string;
        generateDescription: (
          templateVariables: Localization.Notifications.HTTPS_RequestsServiceStarted.TemplateVariables
        ) => string;
      }>;

      newRequest: string;

      nullBytePoisoningAttackAttemptDetected: Readonly<{
        title: string;
        generateDescription: (
          templateVariables: Localization.Notifications.NullBytePoisoningAttackAttemptDetected.TemplateVariables
        ) => string;
      }>;

      directoryTraversalAttackSuspected: Readonly<{
        title: string;
        generateDescription: (
          templateVariables: Localization.Notifications.DirectoryTraversalAttackSuspected.TemplateVariables
        ) => string;
      }>;

    }>;

  }>;

  export namespace Localization {

    export namespace Errors {

      export namespace IP_AddressDoesNotMatchWithSpecifiedDomain {
        export type TemplateVariables = Readonly<{
          domain: string;
          IP_Address: string;
        }>;
      }

      export namespace DomainValidationMalfunction {
        export type TemplateVariables = Readonly<{ domain: string; }>;
      }

      export namespace InvalidHTTP_Method {
        export type TemplateVariables = Readonly<{ HTTP_Method: string; }>;
      }

      export namespace URI_PathAndQueryDecoding {
        export type TemplateVariables = Readonly<{ URI_PathAndQuery: string; }>;
      }

      export namespace HostHTTP_HeaderParsingFailed {
        export type TemplateVariables = Readonly<{
          rawHostHTTP_Header: string;
        }>;
      }

      export namespace WrongPortNumberInHostHTTP_Header {
        export type TemplateVariables = Readonly<{
          portNumberInHostHTTP_Header: number;
          rightPortNumber: number;
        }>;
      }

      export namespace UnknownSubdomain {
        export type TemplateVariables = Readonly<{
          requestedSubdomain: string;
        }>;
      }

      export namespace InvalidRoutePathParameters {

        export namespace DataName {
          export type TemplateVariables = Readonly<{
            targetURI: string;
          }>;
        }

        export namespace Description {
          export type TemplateVariables = Readonly<{
            formattedPreIndentedValidationErrorsMessages: string;
          }>;
        }

      }

      export namespace InvalidRouteQueryParameters {

        export namespace DataName {
          export type TemplateVariables = Readonly<{
            targetURI: string;
          }>;
        }

        export namespace Description {
          export type TemplateVariables = Readonly<{
            formattedPreIndentedValidationErrorsMessages: string;
          }>;
        }

      }

      export namespace RequestedResourceNotFound {
        export type TemplateVariables = Readonly<{
          potentialRawRelatedPathToPublicFile: string;
        }>;
      }

      export namespace DirectoryInsteadOfFileHasBeenRequested {
        export type TemplateVariables = Readonly<{
          targetPath: string;
        }>;
      }

      export namespace PublicFileSubmittingFailed {
        export type TemplateVariables = Readonly<{
          targetPath: string;
        }>;
      }

    }

    export namespace Notifications {

      export namespace HTTP_RequestsServiceStarted {
        export type TemplateVariables = Readonly<{
          IP_Address: string;
          HTTP_Port: number;
        }>;
      }

      export namespace HTTPS_RequestsServiceStarted {
        export type TemplateVariables = Readonly<{
          IP_Address: string;
          HTTPS_Port: number;
        }>;
      }

      export namespace NullBytePoisoningAttackAttemptDetected {
        export type TemplateVariables = Readonly<{
          formattedHTTP_Headers: string;
        }>;
      }

      export namespace DirectoryTraversalAttackSuspected {
        export type TemplateVariables = Readonly<{
          potentialRawRelatedPathToPublicFile: string;
          formattedPotentialNormalizedAbsolutePathsToPublicFile: string;
          formattedHTTP_RequestHeaders: string;
        }>;
      }

    }

  }

}


export default Server;
