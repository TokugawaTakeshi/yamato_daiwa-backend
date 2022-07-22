import ConfigFromConsoleCommand from "./ConfigFromConsoleCommand";
import ConfigFromDotEnvFile from "./ConfigFromDotEnvFile";
import DefaultConfig from "./DefaultConfig";
import NormalizedConfig from "./NormalizedConfig";


export default abstract class ConfigNormalizer {

  public static normalize(
    {
      configFromConsoleCommand,
      configFromDotenvFile
    }: Readonly<{
      configFromConsoleCommand: ConfigFromConsoleCommand.ParsedArguments;
      configFromDotenvFile: ConfigFromDotEnvFile;
    }>
  ): NormalizedConfig {

    return {
      IP_Address: configFromConsoleCommand.IP_Address ?? configFromDotenvFile.IP_ADDRESS ?? DefaultConfig.IP_Address,
      HTTP_Port: configFromConsoleCommand.HTTP_Port ?? configFromDotenvFile.HTTP_PORT ?? DefaultConfig.HTTP_Port
    };
  }
}
