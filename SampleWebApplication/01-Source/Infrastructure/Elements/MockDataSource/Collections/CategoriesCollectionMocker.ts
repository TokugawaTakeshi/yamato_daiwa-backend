/* --- Enterprise business rules ------------------------------------------------------------------------------------ */
import Category from "@EnterpriseBusinessRules/Category";

/* --- Data --------------------------------------------------------------------------------------------------------- */
import CategoryMocker from "@MockDataSource/Entities/CategoryMocker";


class CategoriesCollectionMocker {

  public static generate(mockingOrder: CategoriesCollectionMocker.MockingOrder): Array<Category> {

    const accumulatingCollection: Array<Category> = [];

    for (const subset of mockingOrder) {

      for (let itemNumber: number = 1; itemNumber <= subset.quantity; itemNumber++) {
        accumulatingCollection.push(CategoryMocker.generate({
          ..."nameInfix" in subset ? { fullOrPartialNameForSearchingImitation: subset.nameInfix } : null,
          ..."specificNames" in subset ? { name: subset.specificNames[itemNumber - 1] } : null
        }));
      }
    }

    return accumulatingCollection;
  }
}


namespace CategoriesCollectionMocker {

  export type MockingOrder = Array<Subset>;

  export type Subset =
      {
        readonly quantity: number;
      } &
      (
        { readonly completelyRandom: true; } |
        { readonly nameInfix: string; } |
        { readonly specificNames: Array<string>; }
      );
}


export default CategoriesCollectionMocker;
