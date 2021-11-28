import { removeNthCharacter } from "@yamato-daiwa/es-extensions";
import removeSpecificSymbolInLastPosition from "./removeSpecificSymbolInLastPosition";


export default function removeSlashes(
    targetString: string,
    options: {
      leading: boolean;
      trailing: boolean;
    }
): string {

  let transformingWorkpiece: string = targetString;

  if (options.leading && transformingWorkpiece.startsWith("/")) {
    transformingWorkpiece = removeNthCharacter(transformingWorkpiece, {
      targetCharacterNumber: 0,
      numerationFrom: 0
    });
  }

  if (options.trailing && transformingWorkpiece.endsWith("/")) {
    transformingWorkpiece = removeSpecificSymbolInLastPosition(transformingWorkpiece, "/");
  }

  return transformingWorkpiece;
}
