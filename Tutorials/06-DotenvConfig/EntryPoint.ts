/* --- Configuration ------------------------------------------------------------------------------------------------ */
import type ConfigFromDotEnvFile from "./ConfigFromDotEnvFile";
import ConfigRepresentative from "./ConfigRepresentative";

/* --- Framework ---------------------------------------------------------------------------------------------------- */
import { Server, Request, Response } from "@yamato-daiwa/backend";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import { HTTP_Methods, RawObjectDataProcessor, convertPotentialStringToNumberIfPossible } from "@yamato-daiwa/es-extensions";
import { ObjectDataFilesProcessor } from "@yamato-daiwa/es-extensions-nodejs";


const configFromDotEnvFile: ConfigFromDotEnvFile = ObjectDataFilesProcessor.processFile({
  filePath: ".env",
  validDataSpecification: {
    nameForLogging: "ConfigurationFromDotenv",
    subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
    properties: {
      IP_ADDRESS: {
        type: String,
        required: false
      },
      HTTP_PORT: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
        type: Number,
        numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger,
        required: false
      }
    }
  },
  synchronously: true
});


ConfigRepresentative.initialize(configFromDotEnvFile);


/* Running the test:
*  ts-node EntryPoint.ts
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
