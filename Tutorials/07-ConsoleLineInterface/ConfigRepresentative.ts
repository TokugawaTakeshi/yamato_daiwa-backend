import NormalizedConfig from "./NormalizedConfig";
import { Logger, ClassRequiredInitializationHasNotBeenExecutedError, isNull } from "@yamato-daiwa/es-extensions";


export default class ConfigRepresentative {

  private static normalizedConfig: NormalizedConfig | null = null;


  public static initialize(normalizedConfig: NormalizedConfig): void {
    ConfigRepresentative.normalizedConfig = normalizedConfig;
  }


  public static get IP_Address(): string {
    return ConfigRepresentative.getConfigWhichExpectedToBeInitialized().IP_Address;
  }

  public static get HTTP_Port(): number {
    return ConfigRepresentative.getConfigWhichExpectedToBeInitialized().HTTP_Port;
  }


  private static getConfigWhichExpectedToBeInitialized(): NormalizedConfig {

    if (isNull(ConfigRepresentative.normalizedConfig)) {
      Logger.throwErrorAndLog({
        errorInstance: new ClassRequiredInitializationHasNotBeenExecutedError({
          className: "ConfigRepresentative",
          initializingMethodName: "initialize"
        }),
        title: ClassRequiredInitializationHasNotBeenExecutedError.localization.defaultTitle,
        occurrenceLocation: "ConfigRepresentative.getConfigWhichExpectedToBeInitialized()"
      });
    }


    return ConfigRepresentative.normalizedConfig;
  }
}
