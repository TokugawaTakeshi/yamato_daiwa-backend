import Product from "@EnterpriseBusinessRules/Product";
import Category from "@EnterpriseBusinessRules/Category";

import ProductMocker from "../Entities/ProductMocker";


class ProductsCollectionMocker {

  public static generate(
    {
      mockingOrder,
      dependencies
    }: {
      mockingOrder: ProductsCollectionMocker.MockingOrder;
      dependencies: {
        categories: Array<Category>;
      };
    }
  ): Array<Product> {

    const accumulatingCollection: Array<Product> = [];

    for (const subset of mockingOrder) {

      for (let itemNumber: number = 1; itemNumber <= subset.itemsQuantity; itemNumber++) {
        accumulatingCollection.push(ProductMocker.generate({
          ..."nameInfix" in subset ? { fullOrPartialNameForSearchingImitation: subset.nameInfix } : null,
          allowedCategories: dependencies.categories,
          allOptionals: subset.allOptionals ?? false
        }));
      }
    }

    return accumulatingCollection;
  }
}


namespace ProductsCollectionMocker {

  export type MockingOrder = Array<Subset>;

  export type Subset =
      {
        readonly itemsQuantity: number;
        readonly allOptionals?: boolean;
      } &
      (
        { readonly completelyRandom: true; } |
        { readonly nameInfix: string; } |
        { readonly specificNames: Array<string>; }
      );
}


export default ProductsCollectionMocker;
