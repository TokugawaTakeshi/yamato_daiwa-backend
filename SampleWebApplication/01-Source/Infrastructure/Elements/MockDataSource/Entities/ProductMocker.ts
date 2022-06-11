/* --- Enterprise business rules ------------------------------------------------------------------------------------ */
import Product from "@EnterpriseBusinessRules/Product";
import Category from "@EnterpriseBusinessRules/Category";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import {
  getRandomString,
  getRandomInteger,
  isNotUndefined,
  getRandomArrayElement
} from "@yamato-daiwa/es-extensions";
import arithmeticMean from "@Utils/arithmeticMean";
import manageOptionalValueAdding from "@MockDataSource/manageOptionalValueAdding";


export default class ProductMocker {

  public static generate(
    namedParameters: Partial<Product> & {
      fullOrPartialNameForSearchingImitation?: string;
      allowedCategories: Array<Category>;
      allOptionals: boolean;
    }
  ): Product {

    const ID: Product.ID = namedParameters.ID ?? ProductMocker.generateUniqueID();

    const name: string = namedParameters.name ??
        getRandomString({
          minimalCharactersCount: Product.Name.MINIMAL_CHARACTERS_COUNT,
          maximalCharactersCount: Product.Name.MAXIMAL_CHARACTERS_COUNT,
          ...isNotUndefined(namedParameters.fullOrPartialNameForSearchingImitation) ? {
            infix: namedParameters.fullOrPartialNameForSearchingImitation
          } : null,
          minimalRandomlyGeneratedCharactersCount:
            arithmeticMean(Product.Name.MINIMAL_CHARACTERS_COUNT, Product.Name.MAXIMAL_CHARACTERS_COUNT)
        });

    const description: string | undefined = manageOptionalValueAdding({
      demandedValue: namedParameters.description,
      defaultGeneratedValue: getRandomString({
        minimalCharactersCount: Product.Description.MINIMAL_CHARACTERS_COUNT,
        maximalCharactersCount: Product.Description.MAXIMAL_CHARACTERS_COUNT
      }),
      allOptionalsDemanded: namedParameters.allOptionals
    });

    const category: Category = isNotUndefined(namedParameters.category) ?
          namedParameters.category : getRandomArrayElement(namedParameters.allowedCategories);

    const price__yen__includingTax: number =
        namedParameters.price__yen__includingTax ??
        getRandomInteger({
          minimalValue: Product.Price__Yen__IncludingTax.MINIMAL_VALUE,
          maximalValue: Product.Price__Yen__IncludingTax.MAXIMAL_VALUE
        });

    return {
      ID,
      name,
      ...isNotUndefined(description) ? { description } : null,
      category,
      price__yen__includingTax
    };
  }


  private static counterForUniqueID_Generating: number = 0;

  private static generateUniqueID(): Product.ID {

    ProductMocker.counterForUniqueID_Generating = ProductMocker.counterForUniqueID_Generating + 1;

    return getRandomString({
      prefix: String(ProductMocker.counterForUniqueID_Generating),
      minimalCharactersCount: Category.ID.MINIMAL_CHARACTERS_COUNT
    });
  }
}
