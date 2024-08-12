import type Router from "../Router";

/* ─── Errors ─────────────────────────────────────────────────────────────────────────────────────────────────────── */
import InvalidRoutePathParametersError from "../Errors/InvalidRoutePathParameters/InvalidRoutePathParametersError";
import InvalidURI_QueryParametersError from "../Errors/InvalidURI_QueryParameters/InvalidURI_QueryParametersError";

/* ─── General Utils ──────────────────────────────────────────────────────────────────────────────────────────────── */
import {
  Logger,
  isNotUndefined,
  type HTTP_Methods,
  type ParsedJSON_Object,
  type Log,
  RawObjectDataProcessor
} from "@yamato-daiwa/es-extensions";
import parseCookieHTTP_Header from "../Utils/parseCookieHTTP_Header";

/* ─── Localization ───────────────────────────────────────────────────────────────────────────────────────────────── */
import requestLocalization__english from "./RequestLocalization.english";


class Request {

  public static localization: Request.Localization = requestLocalization__english;

  public readonly HTTP_Method: HTTP_Methods;
  public readonly URI: Readonly<Omit<URL, "hash">>;
  public readonly parsedCookies: ReadonlyMap<string, string>;
  public readonly subdomainParameters: Request.SubdomainParameters;

  protected readonly rawRoutePathParameters?: Request.RawRoutePathParameters;
  protected readonly rawURI_QueryParameters?: Request.RawURI_QueryParameters;
  protected readonly stringifiedRoute?: string;


  public constructor(
    {
      HTTP_Method,
      URI,
      cookieHTTP_Header,
      rawRoutePathParameters,
      rawURI_QueryParameters,
      subdomainParameters,
      routePathTemplate
    }: Readonly<{
      HTTP_Method: HTTP_Methods;
      URI: Readonly<Omit<URL, "hash">>;
      cookieHTTP_Header?: string;
      rawRoutePathParameters?: Request.RawRoutePathParameters;
      rawURI_QueryParameters?: Request.RawURI_QueryParameters;
      subdomainParameters?: Request.SubdomainParameters;
      routePathTemplate?: string;
    }>
  ) {

    this.HTTP_Method = HTTP_Method;
    this.URI = URI;

    this.parsedCookies = isNotUndefined(cookieHTTP_Header) ?
        parseCookieHTTP_Header(cookieHTTP_Header) : new Map<string, string>();

    this.subdomainParameters = subdomainParameters ?? {};

    this.rawRoutePathParameters = rawRoutePathParameters;
    this.rawURI_QueryParameters = rawURI_QueryParameters;

    if (isNotUndefined(routePathTemplate)) {
      this.stringifiedRoute = `${ this.HTTP_Method }::${ routePathTemplate }`;
    }

  }


  public validateAndProcessRoutePathParameters<
    ProcessedRoutePathParameters extends Request.ProcessedRoutePathParameters
  >(validationAndProcessing: RawObjectDataProcessor.PropertiesSpecification): ProcessedRoutePathParameters {

    const routePathParametersProcessingResult: RawObjectDataProcessor.ProcessingResult<ProcessedRoutePathParameters> =
          RawObjectDataProcessor.process(
            this.rawRoutePathParameters,
            {
              nameForLogging: Request.localization.titles.routePath.
                  generate({ stringifiedRoute: this.stringifiedRoute ?? "" }), // FIXME
              subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
              properties: validationAndProcessing
            }
          );

    if (routePathParametersProcessingResult.rawDataIsInvalid) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidRoutePathParametersError({
          route: this.stringifiedRoute,
          preFormattedValidationErrorsMessage: RawObjectDataProcessor.
              formatValidationErrorsList(routePathParametersProcessingResult.validationErrorsMessages)
        }),
        title: InvalidRoutePathParametersError.localization.defaultTitle,
        occurrenceLocation: "request.validateAndProcessRoutePathParameters(validationAndProcessing)",
      });
    }


    return routePathParametersProcessingResult.processedData;

  }

  public validateAndProcessURI_QueryParameters<
    ProcessedURI_QueryParameters extends Request.ProcessedURI_QueryParameters
  >(validationAndProcessing: RawObjectDataProcessor.PropertiesSpecification): ProcessedURI_QueryParameters {

    const URI_QueryParametersProcessingResult: RawObjectDataProcessor.ProcessingResult<ProcessedURI_QueryParameters> =
          RawObjectDataProcessor.process(
            this.rawURI_QueryParameters,
            {
              nameForLogging: Request.localization.titles.URI_Query.
                  generate({ stringifiedRoute: this.stringifiedRoute ?? "" }), // FIXME
              subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
              properties: validationAndProcessing
            }
          );

    if (URI_QueryParametersProcessingResult.rawDataIsInvalid) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidURI_QueryParametersError({
          route: this.stringifiedRoute,
          preFormattedValidationErrorsMessage: RawObjectDataProcessor.
              formatValidationErrorsList(URI_QueryParametersProcessingResult.validationErrorsMessages)
        }),
        title: InvalidURI_QueryParametersError.localization.defaultTitle,
        occurrenceLocation: "request.validateAndProcessURI_QueryParameters(validationAndProcessing)"
      });
    }


    return URI_QueryParametersProcessingResult.processedData;

  }

}


namespace Request {

  export type RawRoutePathParameters = Router.RoutePathParameters;
  export type ProcessedRoutePathParameters = Readonly<{ [parameterName: string]: string | number | undefined; }>;

  export type RawURI_QueryParameters = ParsedJSON_Object;
  export type ProcessedURI_QueryParameters = ParsedJSON_Object;

  export type SubdomainParameters = Readonly<{ [parameterName: string]: string | undefined; }>;


  /* ━━━ Localization ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  export type Localization = Readonly<{

    errors: Readonly<{
      unableToAccessToProcessedRoutePathParameters: Pick<Log, "title" | "description">;
      unableToAccessToProcessedURI_QueryParameters: Pick<Log, "title" | "description">;
    }>;

    titles: Readonly<{
      routePath: Readonly<{
        generate: (templateVariables: Localization.Titles.RoutePath.DataName.TemplateVariables) => string;
      }>;
      URI_Query: Readonly<{
        generate: (templateVariables: Localization.Titles.URI_Query.DataName.TemplateVariables) => string;
      }>;
    }>;

  }>;

  export namespace Localization {

    export namespace Titles {

      export namespace RoutePath {
        export namespace DataName {
          export type TemplateVariables = Readonly<{
            stringifiedRoute: string;
          }>;
        }
      }

      export namespace URI_Query {
        export namespace DataName {
          export type TemplateVariables = Readonly<{
            stringifiedRoute: string;
          }>;
        }
      }

    }

  }

}


export default Request;
