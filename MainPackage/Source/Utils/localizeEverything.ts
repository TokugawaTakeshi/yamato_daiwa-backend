import Server from "../Server/Server";

import ConfigurationNormalizer from "../ConfigurationNormalizer/ConfigurationNormalizer";


export function localizeEverything(
  {
    server: serverLocalization,
    configurationNormalizer: configurationNormalizerLocalization
  }: Readonly<{
    configurationNormalizer: ConfigurationNormalizer.Localization;
    server: Server.Localization;
  }>
): void {

  Server.localization = serverLocalization;
  ConfigurationNormalizer.localization = configurationNormalizerLocalization;

}
