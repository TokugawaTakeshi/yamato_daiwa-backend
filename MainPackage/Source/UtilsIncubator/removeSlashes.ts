import { removeNthCharacter, removeSpecificCharacterFromCertainPosition } from "@yamato-daiwa/es-extensions";


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
    transformingWorkpiece = removeSpecificCharacterFromCertainPosition({
      targetString: transformingWorkpiece,
      targetCharacter: "/",
      fromLastPosition: true
    });
  }

  return transformingWorkpiece;
}
