import { ConsoleCommandsParser } from "@yamato-daiwa/es-extensions-nodejs";
import { RawObjectDataProcessor } from "@yamato-daiwa/es-extensions";


namespace ConfigFromConsoleCommand {

  export const specification: ConsoleCommandsParser.CommandLineInterfaceSpecification = {
    applicationName: "Server",
    applicationDescription: "Example server application",
    commandPhrases: {
      run: {
        description: "Runs the server",
        isDefault: true,
        options: {
          dotEnvConfig: {
            newName: "dotEnvConfigFileRelativePath",
            type: ConsoleCommandsParser.ParametersTypes.string,
            required: true
          },
          IP_Address: {
            type: ConsoleCommandsParser.ParametersTypes.string,
            required: false
          },
          HTTP_Port: {
            type: ConsoleCommandsParser.ParametersTypes.number,
            numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger,
            required: false
          }
        }
      }
    }
  };

  export type ParsedArguments = Readonly<{
    dotEnvConfigFileRelativePath: string;
    IP_Address?: string;
    HTTP_Port?: number;
  }>;
}


export default ConfigFromConsoleCommand;
