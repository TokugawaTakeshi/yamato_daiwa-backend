/* --- Entities ----------------------------------------------------------------------------------------------------- */
import Category from "@Entities/Category";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import { getRandomString, getArithmeticMean, isNotUndefined } from "@yamato-daiwa/es-extensions";


export default class CategoryMocker {

  private static counterForID_Generating: number = 0;


  public static generate(
    preDefinedFields: Partial<Category>,
    options: Readonly<{ nameInfixForSearchingImitation?: string; }> = {}
  ): Category {

    const ID: Category.ID = preDefinedFields.ID ?? CategoryMocker.generateID();

    const name: string = preDefinedFields.name ??
        getRandomString({
          minimalCharactersCount: Category.Name.MINIMAL_CHARACTERS_COUNT,
          maximalCharactersCount: Category.Name.MAXIMAL_CHARACTERS_COUNT,
          ...isNotUndefined(options.nameInfixForSearchingImitation) ? { infix: options.nameInfixForSearchingImitation } : null,
          minimalRandomlyGeneratedCharactersCount: getArithmeticMean(
            Category.Name.MINIMAL_CHARACTERS_COUNT,
            Category.Name.MAXIMAL_CHARACTERS_COUNT
          )
        });

    return {
      ID,
      name
    };

  }


  private static generateID(): Category.ID {

    CategoryMocker.counterForID_Generating = CategoryMocker.counterForID_Generating + 1;

    return getRandomString({
      prefix: String(CategoryMocker.counterForID_Generating),
      minimalCharactersCount: Category.ID.MINIMAL_CHARACTERS_COUNT
    });

  }

}
