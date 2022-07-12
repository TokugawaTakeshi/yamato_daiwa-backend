import type { HTTP_Methods, ParsedJSON_Object } from "@yamato-daiwa/es-extensions";


type Request = Readonly<{

  URI: Readonly<Omit<URL, "hash">>;
  HTTP_Method: HTTP_Methods;

  routePathParameters: Request.RoutePathParameters;
  $processedRoutePathParameters?: Request.RoutePathProcessedParameters;
  getProcessedRoutePathParameters:
      <ProcessedRootPathParameters extends Request.RoutePathProcessedParameters>() => ProcessedRootPathParameters;

  $processedQueryParameters?: ParsedJSON_Object;
  getProcessedQueryParameters: <ProcessedQueryParameters extends ParsedJSON_Object>() => ProcessedQueryParameters;

  subdomainParameters: Request.SubdomainParameters;
}>;


/* eslint-disable-next-line @typescript-eslint/no-redeclare --
* type/interface and namespace merging is supported TypeScript scenario and unwanted to be warned by @typescript-eslint.
* Related issue: https://github.com/typescript-eslint/typescript-eslint/issues/2818 */
namespace Request {
  export type RoutePathParameters = Readonly<{ [parameterName: string]: string | undefined; }>;
  export type RoutePathProcessedParameters = Readonly<{ [parameterName: string]: string | number | undefined; }>;
  export type SubdomainParameters = Readonly<{ [parameterName: string]: string | undefined; }>;
}


export default Request;
