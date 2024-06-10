/* eslint-disable @typescript-eslint/member-ordering -- Organizing of members in this class is semantic. */

/* --- Enterprise business rules ------------------------------------------------------------------------------------ */
import type Product from "@Entities/Product";
import type Category from "@Entities/Category";

/* --- Data --------------------------------------------------------------------------------------------------------- */
import ProductMocker from "@MockDataSource/Entities/ProductMocker";
import ProductsCollectionsMocker from "@MockDataSource/Collections/ProductsCollectionsMocker";
import type ProductGateway from "@Gateways/ProductGateway";
import CategoryMocker from "@MockDataSource/Entities/CategoryMocker";
import CategoriesCollectionsMocker from "@MockDataSource/Collections/CategoriesCollectionsMocker";
import type CategoryGateway from "@Gateways/CategoryGateway";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import {
  DataMocking,
  getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne,
  removeArrayElementsByPredicates,
  replaceArrayElementsByPredicates,
  Logger,
  isNotUndefined
} from "@yamato-daiwa/es-extensions";


export default class MockDataSource {

  /* === Data ======================================================================================================= */
  public readonly categories: Array<Category> = [];
  private readonly categoryUpdatingSubscribers: Array<
    (namedParameters: Readonly<{ newCategory: Category; oldCategory: Category; }>) => void
  > = [];

  public readonly products: Array<Product> = [];


  /* === Initialization ============================================================================================= */
  private static selfSoleInstance: MockDataSource | null = null;

  public static getInstance(): MockDataSource {

    if (MockDataSource.selfSoleInstance === null) {

      MockDataSource.selfSoleInstance = new MockDataSource();

      Logger.logSuccess({
        title: "Mock data source initialization complete",
        description: "Mock data source has been initialized. This feature must not be in production mode."
      });

    }


    return MockDataSource.selfSoleInstance;

  }

  private constructor() {

    this.categories = CategoriesCollectionsMocker.generate([
      {
        withNames: [
          "Beverages",
          "Salads",
          "Fish",
          "Meat",
          "Vegetarian",
          "Bread",
          "Milk products",
          "High calories",
          "Dessert"
        ]
      },
      {
        nameInfixForSearchingImitation: "-SEARCHING_TEST-",
        quantity: 3
      },
      {
        completelyRandom: true,
        quantity: 2
      }
    ]);

    this.products = ProductsCollectionsMocker.generate({
      mockingOrder: [
        {
          nameInfixForSearchingImitation: "テスト",
          optionalPropertiesDecisionStrategy: DataMocking.OptionalPropertiesDecisionStrategies.
              mustGenerateWith50PercentageProbability,
          quantity: 5
        },
        {
          completelyRandom: true,
          optionalPropertiesDecisionStrategy: DataMocking.OptionalPropertiesDecisionStrategies.mustGenerateAll,
          quantity: 5
        },
        {
          completelyRandom: true,
          optionalPropertiesDecisionStrategy: DataMocking.OptionalPropertiesDecisionStrategies.mustSkipIfHasNotBeenPreDefined,
          quantity: 5
        }
      ],
      dependencies: {
        categories: this.categories
      }
    });

  }


  /* === Category =================================================================================================== */
  public addCategory(requestData: CategoryGateway.Adding.RequestData): Category.ID {
    const newCategory: Category = CategoryMocker.generate(requestData);
    this.categories.unshift(newCategory);
    return newCategory.ID;
  }

  public updateCategory(requestData: Category): void {

    const categoryWithSameID: Category = getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne(
      this.categories,
      (category: Category): boolean => category.ID === requestData.ID,
      { mustThrowErrorIfElementNotFoundOrMoreThan1: true }
    );

    const updatedCategory: Category = { ...requestData };

    replaceArrayElementsByPredicates({
      targetArray: this.categories,
      predicate: (category: Category): boolean => category.ID === requestData.ID,
      newValue: updatedCategory,
      mutably: true
    });

    this.onCategoryHasBeenUpdated({
      newCategory: updatedCategory,
      oldCategory: categoryWithSameID
    });

  }

  private onCategoryHasBeenUpdated(namedParameters: Readonly<{ newCategory: Category; oldCategory: Category; }>): void {
    for (const categoryUpdatingSubscriber of this.categoryUpdatingSubscribers) {
      categoryUpdatingSubscriber(namedParameters);
    }
  }

  public deleteCategory(targetCategoryID: Category.ID): void {
    removeArrayElementsByPredicates({
      targetArray: this.categories,
      predicate: (category: Category): boolean => category.ID === targetCategoryID,
      mutably: true
    });
  }


  /* === Product =================================================================================================== */
  public addProduct(requestData: ProductGateway.Adding.RequestData): Product.ID {

    const newProduct: Product = ProductMocker.generate({
      preDefinedFields: requestData,
      dependencies: { categories: this.categories },
      options: {
        optionalPropertiesDecisionStrategy: DataMocking.OptionalPropertiesDecisionStrategies.mustSkipIfHasNotBeenPreDefined
      }
    });

    this.products.unshift(newProduct);

    return newProduct.ID;

  }

  public updateProduct(requestData: ProductGateway.Updating.RequestData): void {

    const productWithSameID: Product = getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne<Product>(
      this.products,
      (product: Product): boolean => product.ID === requestData.ID,
      { mustThrowErrorIfElementNotFoundOrMoreThan1: true }
    );

    const updatedProduct: Product = {
      ...productWithSameID,
      ...isNotUndefined(requestData.name) ? { name: requestData.name } : null,
      ...isNotUndefined(requestData.description) ? { description: requestData.description } : null,
      ...isNotUndefined(requestData.price__yen__includingTax) ? {
        price__yen__includingTax: requestData.price__yen__includingTax
      } : null,
      ...isNotUndefined(requestData.categoryID) ? {
        category: getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne<Category>(
          this.categories,
          (category: Category): boolean => category.ID === requestData.categoryID,
          { mustThrowErrorIfElementNotFoundOrMoreThan1: true }
        )
      } : null
    };

    replaceArrayElementsByPredicates({
      targetArray: this.products,
      predicate: (product: Product): boolean => product.ID === requestData.ID,
      newValue: updatedProduct,
      mutably: true
    });

  }

  public deleteProduct(targetProductID: Product.ID): void {
    removeArrayElementsByPredicates({
      targetArray: this.products,
      predicate: (product: Product): boolean => product.ID === targetProductID,
      mutably: true
    });
  }

}
