/* --- Configuration ------------------------------------------------------------------------------------------------ */
import ConsoleLineInterface from "./ConfigFromConsoleCommand";
import ConfigFromDotEnvFile from "./ConfigFromDotEnvFile";
import NormalizedConfig from "./NormalizedConfig";
import ConfigNormalizer from "./ConfigNormalizer";
import ConfigRepresentative from "./ConfigRepresentative";

/* --- Framework ---------------------------------------------------------------------------------------------------- */
import { Server, Request, Response } from "@yamato-daiwa/backend";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";
import { ConsoleCommandsParser, ObjectDataFilesProcessor } from "@yamato-daiwa/es-extensions-nodejs";


const configFromConsoleCommand: ConsoleCommandsParser.ParsedCommand<ConsoleLineInterface.ParsedArguments> =
    ConsoleCommandsParser.parse(ConsoleLineInterface.specification);

const configFromDotenvFile: ConfigFromDotEnvFile = ObjectDataFilesProcessor.processFile({
  filePath: configFromConsoleCommand.dotEnvConfigFileRelativePath,
  schema: ObjectDataFilesProcessor.SupportedSchemas.DOTENV,
  validDataSpecification: ConfigFromDotEnvFile.specification,
  synchronously: true
});

const normalizedConfig: NormalizedConfig = ConfigNormalizer.normalize({
  configFromConsoleCommand, configFromDotenvFile
});

ConfigRepresentative.initialize(normalizedConfig);


/* Running the test:
*  ts-node EntryPoint.ts --dotEnvConfig .env.local
*  ts-node EntryPoint.ts --dotEnvConfig .env.production
* */
Server.initializeAndStart({
  IP_Address: ConfigRepresentative.IP_Address,
  HTTP: { port: ConfigRepresentative.HTTP_Port },
  routing: [
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top page</h1>"
        });
      }
    }
  ]
});
