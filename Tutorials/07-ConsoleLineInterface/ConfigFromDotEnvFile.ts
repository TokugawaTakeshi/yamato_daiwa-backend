import { convertPotentialStringToNumberIfPossible, RawObjectDataProcessor } from "@yamato-daiwa/es-extensions";


type ConfigFromDotEnvFile = Readonly<{
  IP_ADDRESS?: string;
  HTTP_PORT?: number;
}>;


namespace ConfigFromDotEnvFile {

  export const specification: RawObjectDataProcessor.ObjectDataSpecification = {
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
  };
}


export default ConfigFromDotEnvFile;
