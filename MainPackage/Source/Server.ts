import HTTP from "http";
import HTTPS from "https";
import FileSystem from "fs";

import Request from "./Request";
import Response from "./Response/Response";
import Router from "./Router/Router";
import Middleware from "./Middleware/Middleware";

import HTTP_Response from "./Response/HTTP_Response";
import CORS_Middleware from "./Middleware/CORS_Middleware";

import {
  HTTP_StatusCodes,
  HTTP_Methods,
  Logger,
  UnsupportedScenarioError,
  UnexpectedEventError,
  InvalidConfigError,
  SuccessLog,
  isUndefined,
  isNotUndefined,
  isNull,
  isNotNull,
  isElementOfEnumeration,
  substituteWhenUndefined
} from "@yamato-daiwa/es-extensions";
import ServerLocalization__English from "./Server.localization.english";

import SubdomainsHelper from "./Helpers/SubdomainsHelper";


class Server {

  private readonly config: Server.NormalizedConfig;
  private readonly localization: Server.Localization = ServerLocalization__English;
  private readonly middlewareHandlers: Array<Middleware> = [ CORS_Middleware ];


  public static initializeAndStart(configuration: Server.RawConfig): Server {
    return new Server(configuration).start();
  }

  public static initialize(configuration: Server.RawConfig): Server {
    return new Server(configuration);
  }


  private constructor(rawConfig: Server.RawConfig) {

    if (isUndefined(rawConfig.HTTP) && isUndefined(rawConfig.HTTPS)) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidConfigError({
          customMessage: "Both HTTP and HTTPS settings has not been specified. Nothing to serve."
        }),
        title: InvalidConfigError.DEFAULT_TITLE,
        occurrenceLocation: "Server.initializeAndStart|initialize(rawConfig)"
      });
    }

    const routing: Router.NormalizedRouting = Router.normalizeRouting(rawConfig.routing);

    const subdomainsConfig: Server.NormalizedConfig.Subdomains | null =
        SubdomainsHelper.normalizeSubdomainsConfig({ rawSubdomainsConfig: rawConfig.subdomains, defaultRouting: routing });

    this.config = {
      host: rawConfig.host,
      ...isNotUndefined(rawConfig.HTTP) ? { HTTP: rawConfig.HTTP } : null,
      ...isNotUndefined(rawConfig.HTTPS) ? { HTTPS: rawConfig.HTTPS } : null,
      routing,
      ...isNotNull(subdomainsConfig) ? { subdomains: subdomainsConfig } : null
    };
  }


  public start(): Server {

    this.startHTTP_RequestServingIfCorrespondingConfigDefined();
    this.startHTTPS_RequestServingIfCorrespondingConfigDefined();

    return this;
  }


  private startHTTP_RequestServingIfCorrespondingConfigDefined(): void {

    if (isUndefined(this.config.HTTP)) {
      return;
    }


    const HTTP_Config: Server.RawConfig.HTTP = this.config.HTTP;

    try {

      HTTP.

          createServer(
            (request: HTTP.IncomingMessage, rawResponse: HTTP.ServerResponse): void => {
              this.requestMasterListener(request, rawResponse, {
                protocol: "http",
                port: HTTP_Config.port
              }).
                  catch((error: unknown): void => {
                    Logger.logError({
                      errorType: UnexpectedEventError.NAME,
                      title: UnexpectedEventError.DEFAULT_TITLE,
                      description: "The 'requestMasterListener' did not catch all errors as expected. " +
                          "Bellow error has been passed.",
                      occurrenceLocation: "server.startHTTP_RequestServingIfCorrespondingConfigDefined()",
                      caughtError: error
                    });
                  });
            }
          ).

          listen(HTTP_Config.port, (): void => {
            Logger.logSuccess(this.localization.successMessages.HTTP_RequestsServiceStarted({
              host: this.config.host, HTTP_Port: HTTP_Config.port
            }));
          });

    } catch (error: unknown) {
      Logger.logError({
        errorType: "HTTP_RequestsServingBootstrapError",
        title: "HTTP request serving bootstrapping failure",
        description: "The bootstrapping of HTTP requests serving functionality failed.",
        occurrenceLocation: "server.startHTTP_RequestServingIfCorrespondingConfigDefined()",
        caughtError: error
      });
    }
  }

  private startHTTPS_RequestServingIfCorrespondingConfigDefined(): void {

    if (isUndefined(this.config.HTTPS)) {
      return;
    }


    const HTTPS_Config: Server.RawConfig.HTTPS = this.config.HTTPS;

    try {

      HTTPS.

          createServer(
            {
              key: FileSystem.readFileSync(HTTPS_Config.SSL_KeyFileAbsolutePath),
              cert: FileSystem.readFileSync(HTTPS_Config.SSL_CertificateFileAbsolutePath)
            },
            (request: HTTP.IncomingMessage, rawResponse: HTTP.ServerResponse): void => {
              this.requestMasterListener(request, rawResponse, {
                protocol: "https",
                port: HTTPS_Config.port
              }).
                  catch((error: unknown): void => {
                    Logger.logError({
                      errorType: UnexpectedEventError.NAME,
                      title: UnexpectedEventError.DEFAULT_TITLE,
                      description: "The 'requestMasterListener' did not catch all errors as expected. " +
                          "Bellow error has been passed.",
                      occurrenceLocation: "server.startHTTPS_RequestServingIfCorrespondingConfigDefined()",
                      caughtError: error
                    });
                  });
            }
          ).

          listen(HTTPS_Config, (): void => {
            Logger.logSuccess(this.localization.successMessages.HTTPS_RequestsServiceStarted({
              host: this.config.host, HTTPS_Port: HTTPS_Config.port
            }));
          });

    } catch (error: unknown) {

      Logger.logError({
        errorType: "HTTPS_RequestsServingBootstrapError",
        title: "HTTPS request serving bootstrapping failure",
        description: "The bootstrapping of HTTPS requests serving functionality failed.",
        occurrenceLocation: "server.startHTTPS_RequestServingIfCorrespondingConfigDefined()",
        caughtError: error
      });
    }
  }


  private async requestMasterListener(
    request: HTTP.IncomingMessage,
    rawResponse: HTTP.ServerResponse,
    loggingData: {
      port: number;
      protocol: string;
    }
  ): Promise<void> {

    Logger.logInfo({
      title: "New request",
      description: `${request.method}::${request.url}\n${JSON.stringify(request.headers, null, 2)}`
    });


    /* [ Reference ] https://stackoverflow.com/q/68830792/4818123 */
    if (isUndefined(request.method)) {

      Logger.logError({
        errorType: UnsupportedScenarioError.NAME,
        title: UnsupportedScenarioError.DEFAULT_TITLE,
        description: "The HTTP method is not defined.",
        occurrenceLocation: "Server.requestMasterListener(request, rawResponse)"
      });

      rawResponse.
          writeHead(HTTP_StatusCodes.badRequest, "HTTP method is not specified").
          end();

      return;
    }


    if (!isElementOfEnumeration(request.method, HTTP_Methods)) {

      Logger.logError({
        errorType: UnsupportedScenarioError.NAME,
        title: UnsupportedScenarioError.DEFAULT_TITLE,
        description: `The HTTP method: ${request.method} is not supported.`,
        occurrenceLocation: "Server.requestMasterListener(request, rawResponse)"
      });

      rawResponse.
          writeHead(HTTP_StatusCodes.notImplemented, "Unsupported HTTP method").
          end();

      return;
    }


    const HTTP_Method: HTTP_Methods = request.method;

    /* [ Reference ] https://stackoverflow.com/q/68830828/4818123 */
    if (isUndefined(request.url)) {

      Logger.logError({
        errorType: UnsupportedScenarioError.NAME,
        title: UnsupportedScenarioError.DEFAULT_TITLE,
        description: "The request URL is not defined.",
        occurrenceLocation: "Server.requestMasterListener(request, rawResponse)"
      });

      rawResponse.
          writeHead(HTTP_StatusCodes.badRequest, "The request URL is undefined").
          end();

      return;
    }


    const URI_Path: string = request.url;
    const actualSubdomainConfig: Server.NormalizedConfig.Subdomains.ConfigMatch | null = SubdomainsHelper.
        getSubdomainConfig(request, this.config.subdomains);
    const appropriateRouting: Router.NormalizedRouting =
        substituteWhenUndefined(actualSubdomainConfig?.config.routing, this.config.routing);


    const normalizedRequest: Request = {
      URL: new URL(URI_Path, `${loggingData.protocol}://${this.config.host}:${loggingData.port}/`),
      HTTP_Method,
      subdomainParameters: { ...actualSubdomainConfig?.parameterizedHostNameLabels_Values }
    };

    const routeMatch: Router.RouteMatch | null = Router.getRouteMatch(normalizedRequest, appropriateRouting);

    if (isNull(routeMatch)) {
      rawResponse.
          writeHead(HTTP_StatusCodes.notFound, "The requested URI is not in service.").
          end();
      return;
    }


    const response: Response = new HTTP_Response(rawResponse);

    for (const middleware of this.middlewareHandlers) {

      /* [ ESLint muting rationale ] The middleware must be executed sequentially. */
      /* eslint-disable-next-line no-await-in-loop */
      const middlewareCompletionSignal: Middleware.CompletionSignal = await middleware(
        normalizedRequest, response, this.config
      );

      if (middlewareCompletionSignal === Middleware.CompletionSignal.finishRequestHandling) {
        return;
      }
    }


    routeMatch.handler(normalizedRequest, response, routeMatch.routeParameters).catch(
      (error: unknown): void => {
        Logger.logError({
          errorType: UnexpectedEventError.NAME,
          title: UnexpectedEventError.DEFAULT_TITLE,
          description: "The error occurred during request handler execution.",
          occurrenceLocation: "Server.requestMasterListener(request, rawResponse)",
          caughtError: error
        });
      }
    );
  }
}


namespace Server {

  export type RawConfig = {
    host: string;
    HTTP?: RawConfig.HTTP;
    HTTPS?: RawConfig.HTTPS;
    routing: Router.RawRouting;
    subdomains?: RawConfig.Subdomains;
  };

  export namespace RawConfig {

    export type HTTP = {
      port: number;
    };

    export type HTTPS = {
      port: number;
      SSL_KeyFileAbsolutePath: string;
      SSL_CertificateFileAbsolutePath: string;
    };

    export type Subdomains = { [subdomainPattern: string]: Subdomain; };

    export type Subdomain = {
      routing?: Router.RawRouting;
    };
  }

  export type NormalizedConfig = {
    host: string;
    HTTP?: NormalizedConfig.HTTP;
    HTTPS?: NormalizedConfig.HTTPS;
    routing: Router.NormalizedRouting;
    subdomains?: NormalizedConfig.Subdomains;
  };

  export namespace NormalizedConfig {

    export type HTTP = {
      port: number;
    };

    export type HTTPS = {
      port: number;
      SSL_KeyFileAbsolutePath: string;
      SSL_CertificateFileAbsolutePath: string;
    };

    export type Subdomains = Subdomains.TreeNodes;

    export type Subdomain = {
      routing?: Router.NormalizedRouting;
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

  export type Localization = {
    successMessages: {
      HTTP_RequestsServiceStarted: (configuration: Localization.HTTP_RequestsServiceStartedMessageParameters) => SuccessLog;
      HTTPS_RequestsServiceStarted: (configuration: Localization.HTTPS_RequestsServiceStartedMessageParameters) => SuccessLog;
    };
  };

  export namespace Localization {
    export type HTTP_RequestsServiceStartedMessageParameters = { host: string; HTTP_Port: number; };
    export type HTTPS_RequestsServiceStartedMessageParameters = { host: string; HTTPS_Port: number; };
  }
}


export default Server;
