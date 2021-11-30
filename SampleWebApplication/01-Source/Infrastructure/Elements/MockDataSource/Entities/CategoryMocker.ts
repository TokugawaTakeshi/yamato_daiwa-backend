/* --- Enterprise business rules ------------------------------------------------------------------------------------ */
import Category from "@EnterpriseBusinessRules/Category";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import {
  getRandomString,
  isNotUndefined
} from "@yamato-daiwa/es-extensions";
import arithmeticMean from "@Utils/arithmeticMean";


export default class CategoryMocker {

  public static generate(
    namedParameters: Partial<Category> & {
      fullOrPartialNameForSearchingImitation?: string;
    }
  ): Category {

    const ID: Category.ID = namedParameters.ID ?? CategoryMocker.generateID();

    const name: string = namedParameters.name ??
        getRandomString({
          minimalCharactersCount: Category.Name.MINIMAL_CHARACTERS_COUNT,
          maximalCharactersCount: Category.Name.MAXIMAL_CHARACTERS_COUNT,
          ...isNotUndefined(namedParameters.fullOrPartialNameForSearchingImitation) ? {
            infix: namedParameters.fullOrPartialNameForSearchingImitation
          } : null,
          minimalRandomlyGeneratedCharactersCount:
            arithmeticMean(Category.Name.MINIMAL_CHARACTERS_COUNT, Category.Name.MAXIMAL_CHARACTERS_COUNT)
        });

    return {
      ID,
      name
    };
  }


  private static counterForID_Generating: number = 0;

  public static generateID(): Category.ID {

    CategoryMocker.counterForID_Generating = CategoryMocker.counterForID_Generating + 1;

    return getRandomString({
      prefix: String(CategoryMocker.counterForID_Generating),
      minimalCharactersCount: Category.ID.MINIMAL_CHARACTERS_COUNT
    });
  }
}
