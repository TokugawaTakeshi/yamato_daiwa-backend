/* --- Entities ----------------------------------------------------------------------------------------------------- */
import type Category from "@Entities/Category";

/* --- Data --------------------------------------------------------------------------------------------------------- */
import CategoryMocker from "@MockDataSource/Entities/CategoryMocker";


class CategoriesCollectionsMocker {

  public static generate(mockingOrder: CategoriesCollectionsMocker.MockingOrder): Array<Category> {

    const accumulatingCollection: Array<Category> = [];

    for (const subset of mockingOrder) {

      const itemsQuantity: number = "quantity" in subset ? subset.quantity : subset.withNames.length;

      for (let itemNumber: number = 1; itemNumber <= itemsQuantity; itemNumber++) {
        accumulatingCollection.push(CategoryMocker.generate(
          "withNames" in subset ? { name: subset.withNames[itemNumber - 1] } : {},
          "nameInfixForSearchingImitation" in subset ? {
            nameInfixForSearchingImitation: subset.nameInfixForSearchingImitation
          } : {}
        ));

      }

    }

    return accumulatingCollection;

  }

}


namespace CategoriesCollectionsMocker {

  export type MockingOrder = ReadonlyArray<Subset>;

  export type Subset = Readonly<
    {
      completelyRandom: true;
      quantity: number;
    } |
    {
      withNames: ReadonlyArray<string>;
    } |
    {
      nameInfixForSearchingImitation: string;
      quantity: number;
    }
  >;

}


export default CategoriesCollectionsMocker;
