import type { HTTP_Methods, ParsedJSON_Object } from "@yamato-daiwa/es-extensions";


type Request = {

  readonly URI: Omit<URL, "hash">;
  readonly HTTP_Method: HTTP_Methods;

  readonly routePathParameters: Request.RoutePathParameters;
  readonly $processedRoutePathParameters?: Request.RoutePathProcessedParameters;
  readonly getProcessedRoutePathParameters:
      <ProcessedRootPathParameters extends Request.RoutePathProcessedParameters>() => ProcessedRootPathParameters;

  readonly $processedQueryParameters?: ParsedJSON_Object;
  readonly getProcessedQueryParameters: <ProcessedQueryParameters extends ParsedJSON_Object>() => ProcessedQueryParameters;

  // subdomainParameters: Request.SubdomainParameters;
};


/* eslint-disable-next-line @typescript-eslint/no-redeclare --
* type/interface and namespace merging is supported TypeScript scenario and unwanted to be warned by @typescript-eslint.
* Related issue: https://github.com/typescript-eslint/typescript-eslint/issues/2818 */
namespace Request {
  export type RoutePathParameters = { readonly [parameterName: string]: string | undefined; };
  export type RoutePathProcessedParameters = { readonly [parameterName: string]: string | number | undefined; };
  export type SubdomainParameters = { readonly [parameterName: string]: string | undefined; };
}


export default Request;
