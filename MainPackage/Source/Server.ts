import HTTP from "http";
import HTTPS from "https";
import FileSystem from "fs";

import { Request } from "./Request";
import Response from "./Response/Response";
import Router from "./Router/Router";
import Middleware from "./Middleware/Middleware";
import { ControllerInheritingClass } from "./Controller/Controller";

import HTTP_Response from "./Response/HTTP_Response";
import CORS_Middleware from "./Middleware/CORS_Middleware";

import {
  HTTP_StatusCodes,
  HTTP_Methods,
  Logger,
  SuccessLog,
  isUndefined,
  isNotUndefined,
  isNull,
  isElementOfEnumeration,
  UnsupportedScenarioError,
  UnexpectedEventError,
  InvalidConfigError
} from "@yamato-daiwa/es-extensions";
import ServerLocalization__English from "./Server.localization.english";


class Server {

  private readonly host: string;
  private readonly HTTP_Config?: Server.Config.HTTP;
  private readonly HTTPS_Config?: Server.Config.HTTPS;

  private readonly routing: Router.NormalizedRouting;

  private readonly localization: Server.Localization = ServerLocalization__English;

  private readonly middlewareHandlers: Array<Middleware> = [ CORS_Middleware ];


  public static initializeAndStart(configuration: Server.Config): Server {
    return new Server(configuration).start();
  }

  public static initialize(configuration: Server.Config): Server {
    return new Server(configuration);
  }


  private constructor(config: Server.Config) {

    this.host = config.host;

    if (isUndefined(config.HTTP) && isUndefined(config.HTTPS)) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidConfigError({
          customMessage: "Both HTTP and HTTPS settings has not been specified. Nothing to serve."
        }),
        title: InvalidConfigError.DEFAULT_TITLE,
        occurrenceLocation: "Server.initializeAndStart|initialize(config)"
      });
    }

    if (isNotUndefined(config.HTTP)) {
      this.HTTP_Config = config.HTTP;
    }

    if (isNotUndefined(config.HTTPS)) {
      this.HTTPS_Config = config.HTTPS;
    }

    this.routing = Router.normalizeRouting(config.routing);
  }


  public start(): Server {

    this.startHTTP_RequestServingIfRequired();
    this.startHTTPS_RequestServingIfRequired();

    return this;
  }


  private startHTTP_RequestServingIfRequired(): void {

    if (isUndefined(this.HTTP_Config)) {
      return;
    }

    const HTTP_Config: Server.Config.HTTP = this.HTTP_Config;

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
                      occurrenceLocation: "server.startHTTP_RequestServingIfRequired()",
                      caughtError: error
                    });
                  });
            }
          ).

          listen(HTTP_Config.port, (): void => {
            Logger.logSuccess(this.localization.successMessages.HTTP_RequestsServiceStarted({
              host: this.host, HTTP_Port: HTTP_Config.port
            }));
          });

    } catch (error: unknown) {
      Logger.logError({
        errorType: "HTTP_RequestsServingBootstrapError",
        title: "HTTP request serving bootstrapping failure",
        description: "The bootstrapping of HTTP requests serving functionality failed.",
        occurrenceLocation: "server.startHTTP_RequestServingIfRequired()",
        caughtError: error
      });
    }
  }

  private startHTTPS_RequestServingIfRequired(): void {

    if (isUndefined(this.HTTPS_Config)) {
      return;
    }

    const HTTPS_Config: Server.Config.HTTPS = this.HTTPS_Config;

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
                      occurrenceLocation: "server.startHTTPS_RequestServingIfRequired()",
                      caughtError: error
                    });
                  });
            }
          ).

          // FIXME Somehow error which occurring here (e. g. EADDRINUSE port in use)  will not be catched here...
          listen(this.HTTPS_Config, (): void => {
            Logger.logSuccess(this.localization.successMessages.HTTPS_RequestsServiceStarted({
              host: this.host, HTTPS_Port: HTTPS_Config.port
            }));
          });

    } catch (error: unknown) {

      Logger.logError({
        errorType: "HTTPS_RequestsServingBootstrapError",
        title: "HTTPS request serving bootstrapping failure",
        description: "The bootstrapping of HTTPS requests serving functionality failed.",
        occurrenceLocation: "server.startHTTPS_RequestServingIfRequired()",
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


    const normalizedRequest: Request = {
      URL: new URL(URI_Path, `${loggingData.protocol}://${this.host}:${loggingData.port}/`),
      HTTP_Method
    };


    // To reviewer: Please check until here. Below code is a draft.
    // -----------------------------------------------------------------------------------------------------------------
    const routeMatch: Router.RouteMatch | null = Router.getRouteMatch(normalizedRequest, this.routing);

    if (isNull(routeMatch)) {
      rawResponse.
          writeHead(HTTP_StatusCodes.notFound, "The requested URL is not in service.").
          end();
      return;
    }


    /* TODO
        Here we can check the query parameters and if those are invalid - return the Error otherwise
        add to HTTP_Response.
     */
    const response: Response = new HTTP_Response(rawResponse);


    for (const middleware of this.middlewareHandlers) {

      /* 〔 ESLint muting rationale 〕 The middleware must be executed sequentially. */
      /* eslint-disable-next-line no-await-in-loop */
      const middlewareCompletionSignal: Middleware.CompletionSignal = await middleware(normalizedRequest, response);

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

  export type Config = {
    host: string;
    routing: Array<ControllerInheritingClass | Router.RouteAndHandlerPair>;
    HTTP?: Config.HTTP;
    HTTPS?: Config.HTTPS;
  };

  export namespace Config {

    export type HTTP = {
      port: number;
    };

    export type HTTPS = {
      port: number;
      SSL_KeyFileAbsolutePath: string;
      SSL_CertificateFileAbsolutePath: string;
    };
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
