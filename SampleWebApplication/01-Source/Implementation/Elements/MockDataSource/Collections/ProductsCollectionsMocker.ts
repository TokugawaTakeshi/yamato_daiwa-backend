/* --- Entities ----------------------------------------------------------------------------------------------------- */
import type Product from "@Entities/Product";
import type Category from "@Entities/Category";

/* --- Data --------------------------------------------------------------------------------------------------------- */
import ProductMocker from "@MockDataSource/Entities/ProductMocker";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import type { DataMocking } from "@yamato-daiwa/es-extensions";


class ProductsCollectionsMocker {

  public static generate(
    {
      mockingOrder,
      dependencies
    }: Readonly<{
      mockingOrder: ProductsCollectionsMocker.MockingOrder;
      dependencies: {
        categories: ReadonlyArray<Category>;
      };
    }>
  ): Array<Product> {

    const accumulatingCollection: Array<Product> = [];

    for (const subset of mockingOrder) {

      const itemsQuantity: number = "quantity" in subset ? subset.quantity : subset.withNames.length;

      for (let itemNumber: number = 1; itemNumber <= itemsQuantity; itemNumber++) {
        accumulatingCollection.push(ProductMocker.generate({
          preDefinedFields: {
            ..."withNames" in subset ? { name: subset.withNames[itemNumber - 1] } : null
          },
          dependencies: {
            categories: dependencies.categories
          },
          options: {
            optionalPropertiesDecisionStrategy: subset.optionalPropertiesDecisionStrategy,
            ..."nameInfixForSearchingImitation" in subset ? {
              nameInfixForSearchingImitation: subset.nameInfixForSearchingImitation
            } : null
          }

        }));

      }

    }

    return accumulatingCollection;

  }

}


namespace ProductsCollectionsMocker {

  export type MockingOrder = Array<Subset>;

  export type Subset =
      Readonly<{
        completelyRandom: true;
        optionalPropertiesDecisionStrategy: DataMocking.OptionalPropertiesDecisionStrategies;
        quantity: number;
      }> |
      Readonly<{
        withNames: Array<string>;
        optionalPropertiesDecisionStrategy: DataMocking.OptionalPropertiesDecisionStrategies;
      }> |
      Readonly<{
        nameInfixForSearchingImitation: string;
        optionalPropertiesDecisionStrategy: DataMocking.OptionalPropertiesDecisionStrategies;
        quantity: number;
      }>;

}


export default ProductsCollectionsMocker;
