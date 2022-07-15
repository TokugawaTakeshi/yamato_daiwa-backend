import Config from "./Config";
import type ConfigFromDotEnvFile from "./ConfigFromDotEnvFile";

import { ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { Logger, ClassRequiredInitializationHasNotBeenExecutedError, isNull } from "@yamato-daiwa/es-extensions";


export default class ConfigRepresentative {

  private static config: Config | null = null;


  public static initialize(
    configFromDotEnvFile: ConfigFromDotEnvFile
  ): void {
    ConfigRepresentative.config = {
      IP_Address: configFromDotEnvFile.IP_ADDRESS ?? "127.0.0.1",
      HTTP_Port: configFromDotEnvFile.HTTP_PORT ?? ProtocolDependentDefaultPorts.HTTP
    }
  }


  public static get IP_Address(): string {
    return ConfigRepresentative.getConfigWhichExpectedToBeInitialized().IP_Address;
  }

  public static get HTTP_Port(): number {
    return ConfigRepresentative.getConfigWhichExpectedToBeInitialized().HTTP_Port;
  }


  private static getConfigWhichExpectedToBeInitialized(): Config {

    if (isNull(ConfigRepresentative.config)) {
      Logger.throwErrorAndLog({
        errorInstance: new ClassRequiredInitializationHasNotBeenExecutedError({
          className: "ConfigRepresentative",
          initializingMethodName: "initialize"
        }),
        title: ClassRequiredInitializationHasNotBeenExecutedError.localization.defaultTitle,
        occurrenceLocation: "ConfigRepresentative.getConfigWhichExpectedToBeInitialized()"
      });
    }


    return ConfigRepresentative.config;
  }
}
