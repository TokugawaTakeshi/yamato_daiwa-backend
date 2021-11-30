import { getRandomBoolean, isNotUndefined } from "@yamato-daiwa/es-extensions";


export default function manageOptionalValueAdding<ValueType>(
  parametersObject: {
    demandedValue?: ValueType;
    defaultGeneratedValue: ValueType;
    allOptionalsDemanded: boolean;
  }
): ValueType | undefined {

  if (isNotUndefined(parametersObject.demandedValue)) {
    return parametersObject.demandedValue;
  }

  if (parametersObject.allOptionalsDemanded || getRandomBoolean()) {
    return parametersObject.defaultGeneratedValue;
  }


  return void 0;
}
