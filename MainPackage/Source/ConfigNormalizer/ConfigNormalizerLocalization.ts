import ConfigNormalizerLocalization__English from "./ConfigNormalizerLocalization.english";
import type { WarningLog } from "@yamato-daiwa/es-extensions";


type ConfigNormalizerLocalization = Readonly<{
  neitherHTTP_NotHTTPS_SettingsHasBeenSpecifiedError: string;
  redundantExplicitLocalhostWarning: Readonly<Pick<WarningLog, "title" | "description">>;
}>;


export class ConfigNormalizerLocalizer {
  public static localization: ConfigNormalizerLocalization = ConfigNormalizerLocalization__English;
}


export default ConfigNormalizerLocalization;
