import Server from "../Server/Server";
import Request from "../Request/Request";

import ConfigurationNormalizer from "../ConfigurationNormalizer/ConfigurationNormalizer";
import InvalidRoutePathParametersError from "../Errors/InvalidRoutePathParameters/InvalidRoutePathParametersError";
import InvalidURI_QueryParametersError from "../Errors/InvalidURI_QueryParameters/InvalidURI_QueryParametersError";


export function localizeEverything(
  {
    server: serverLocalization,
    request: requestLocalization,
    configurationNormalizer: configurationNormalizerLocalization,
    errors: errorsLocalization
  }: Readonly<{
    server: Server.Localization;
    request: Request.Localization;
    configurationNormalizer: ConfigurationNormalizer.Localization;
    errors: Readonly<{
      invalidRoutePathParameters: InvalidRoutePathParametersError.Localization;
      InvalidURI_QueryParameters: InvalidURI_QueryParametersError.Localization;
    }>;
  }>
): void {

  Server.localization = serverLocalization;
  Request.localization = requestLocalization;
  ConfigurationNormalizer.localization = configurationNormalizerLocalization;

  InvalidRoutePathParametersError.localization = errorsLocalization.invalidRoutePathParameters;
  InvalidURI_QueryParametersError.localization = errorsLocalization.InvalidURI_QueryParameters;

}
