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
    ConsoleCommandsParser.parse(process.argv, ConsoleLineInterface.specification);

const configFromDotenvFile: ConfigFromDotEnvFile = ObjectDataFilesProcessor.processFile({
  filePath: ".env",
  schema: ObjectDataFilesProcessor.SupportedSchemas.DOTENV,
  validDataSpecification: ConfigFromDotEnvFile.specification
});

const normalizedConfig: NormalizedConfig = ConfigNormalizer.normalize({
  configFromConsoleCommand, configFromDotenvFile
});

ConfigRepresentative.initialize(normalizedConfig);


/* Running the test:
*  npx nodemon EntryPoint.ts
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
