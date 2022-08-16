/* --- Entities ----------------------------------------------------------------------------------------------------- */
import Product from "@Entities/Product";
import Category from "@Entities/Category";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import {
  getRandomString,
  getRandomInteger,
  getArithmeticMean,
  DataMocking,
  InvalidParameterValueError,
  Logger,
  isNotUndefined,
  getRandomArrayElement
} from "@yamato-daiwa/es-extensions";


export default abstract class ProductMocker {

  private static counterForID_Generating: number = 0;


  public static generate(
    {
      preDefinedFields = {},
      dependencies,
      options
    }: Readonly<{
      preDefinedFields: Partial<Product>;
      dependencies: Readonly<{
        categories: ReadonlyArray<Category>;
      }>;
      options: Readonly<{
        optionalPropertiesDecisionStrategy?: DataMocking.OptionalPropertiesDecisionStrategies;
        nameInfixForSearchingImitation?: string;
      }>;
    }>
  ): Product {

    if (dependencies.categories.length === 0) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidParameterValueError({
          parameterNumber: 1,
          parameterName: "compoundObject",
          messageSpecificPart: "The \"dependencies.categories\" property must the non-empty array."
        }),
        title: InvalidParameterValueError.localization.defaultTitle,
        occurrenceLocation: "ProductMocker.generate()"
      });
    }


    const ID: Product.ID = preDefinedFields.ID ?? ProductMocker.generateID();

    const name: string = preDefinedFields.name ??
        getRandomString({
          minimalCharactersCount: Product.Name.MINIMAL_CHARACTERS_COUNT,
          maximalCharactersCount: Product.Name.MAXIMAL_CHARACTERS_COUNT,
          ...isNotUndefined(options.nameInfixForSearchingImitation) ? { infix: options.nameInfixForSearchingImitation } : null,
          minimalRandomlyGeneratedCharactersCount: getArithmeticMean(
            Product.Name.MINIMAL_CHARACTERS_COUNT, Product.Name.MAXIMAL_CHARACTERS_COUNT
          )
        });

    const description: string | undefined = DataMocking.decideOptionalValue({
      strategy: DataMocking.OptionalPropertiesDecisionStrategies.mustSkipIfHasNotBeenPreDefined,
      preDefinedValue: preDefinedFields.description,
      randomValueGenerator: (): string => getRandomString({
        minimalCharactersCount: Product.Description.MINIMAL_CHARACTERS_COUNT,
        maximalCharactersCount: Product.Description.MAXIMAL_CHARACTERS_COUNT
      })
    });

    const category: Category = isNotUndefined(preDefinedFields.category) ?
      preDefinedFields.category : getRandomArrayElement(dependencies.categories);

    const price__yen__includingTax: number =
        preDefinedFields.price__yen__includingTax ??
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


  private static generateID(): Product.ID {

    ProductMocker.counterForID_Generating = ProductMocker.counterForID_Generating + 1;

    return getRandomString({
      prefix: String(ProductMocker.counterForID_Generating),
      minimalCharactersCount: Category.ID.MINIMAL_CHARACTERS_COUNT
    });

  }

}
