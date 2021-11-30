/* --- Enterprise business rules ------------------------------------------------------------------------------------ */
// import Product from "@EnterpriseBusinessRules/Product";
import Category from "@EnterpriseBusinessRules/Category";

/* --- Data --------------------------------------------------------------------------------------------------------- */
// import ProductMocker from "@MockDataSource/Entities/ProductMocker";
// import ProductsCollectionMocker from "@MockDataSource/Collections/ProductsCollectionMocker";
// import ProductGateway from "@Gateways/ProductGateway";
import CategoryMocker from "@MockDataSource/Entities/CategoryMocker";
import CategoriesCollectionMocker from "@MockDataSource/Collections/CategoriesCollectionMocker";
import CategoryGateway from "@Gateways/CategoryGateway";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import {
  getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne,
  removeArrayElementsByPredicates,
  replaceArrayElementsByPredicates,
  Logger
} from "@yamato-daiwa/es-extensions";


export default class MockDataSource {

  private static selfSoleInstance: MockDataSource | null = null;

  public readonly categories: Array<Category> = [];
  private readonly categoryUpdatingSubscribers:
      Array<(namedParameters: { newCategory: Category; oldCategory: Category; }) => void> = [];

  // private readonly products: Array<Product> = [];


  public static getInstance(): MockDataSource {

    if (MockDataSource.selfSoleInstance === null) {

      MockDataSource.selfSoleInstance = new MockDataSource();

      Logger.logSuccess({
        title: "Mock data source initialization",
        description: "Mock data source has been generated. (This feature must not be in production mode)."
      });
    }


    return MockDataSource.selfSoleInstance;
  }


  private constructor() {

    const nonGeneratedCategoriesNames: Array<string> = [
      "Beverages", "Salads", "Fish", "Meat", "Milk products", "High calories"
    ];

    this.categories = CategoriesCollectionMocker.generate([
      {
        specificNames: nonGeneratedCategoriesNames,
        quantity: nonGeneratedCategoriesNames.length
      },
      {
        nameInfix: "GENERATED",
        quantity: 10
      },
      {
        completelyRandom: true,
        quantity: 10
      }
    ]);

    // this.products = ProductsCollectionMocker.generate({
    //   mockingOrder: [
    //     { nameInfix: "テスト", itemsQuantity: 10 },
    //     { completelyRandom: true, allOptionals: true, itemsQuantity: 10 },
    //     { completelyRandom: true, itemsQuantity: 10 }
    //   ],
    //   dependencies: {
    //     categories: this.categories
    //   }
    // });
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
      { throwErrorIfElementNotFoundOrMoreThan1: true }
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

  private onCategoryHasBeenUpdated(namedParameters: { newCategory: Category; oldCategory: Category; }): void {
    for (const categoryUpdatingSubscriber of this.categoryUpdatingSubscribers) {
      categoryUpdatingSubscriber(namedParameters);
    }
  }

  public deleteCategory(targetCategoryID: Category.ID): void {

    const arrayIndexOfTargetCategory: number = this.categories.findIndex(
      (category: Category): boolean => category.ID === targetCategoryID
    );

    if (arrayIndexOfTargetCategory !== -1) {
      Logger.throwErrorAndLog({
        errorType: "EntityIsInUseError",
        title: "Entity is in use",
        description: `Category with ID '${targetCategoryID}' is being used thus could not be deleted.`,
        occurrenceLocation: "mockDataSource.deleteCategory(targetCategoryID)"
      });
    }


    removeArrayElementsByPredicates({
      targetArray: this.categories,
      predicate: (category: Category): boolean => category.ID === targetCategoryID,
      mutably: true
    });
  }


  /* === Product =================================================================================================== */
  // public addProduct(requestData: ProductGateway.Adding.RequestData): Product.ID {
  //
  //   const newProduct: Product = ProductMocker.generate({
  //     ...requestData,
  //     allowedCategories: this.categories,
  //     allOptionals: true // TODO 既存の商品の場合の為別のプロパティを作った方が良い
  //   });
  //
  //   this.products.unshift(newProduct);
  //
  //   return newProduct.ID;
  // }
  //
  // public updateProduct(requestData: ProductGateway.Updating.RequestData): void {
  //
  //   const productWithSameID: Product = getArrayElementWhichMustExistByPredicate<Product>(
  //     this.products, (product: Product): boolean => product.ID === requestData.ID
  //   );
  //
  //   const updatedProduct: Product = {
  //     ...productWithSameID,
  //     ...isNotUndefined(requestData.name) ? { name: requestData.name } : null,
  //     ...isNotUndefined(requestData.description) ? { description: requestData.description } : null,
  //     ...isNotUndefined(requestData.price__yen__includingTax) ? {
  //       price__yen__includingTax: requestData.price__yen__includingTax
  //     } : null,
  //     ...isNotUndefined(requestData.categoryID) ? {
  //       category: getArrayElementWhichMustExistByPredicate<Category>(
  //         this.categories, (category: Category): boolean => category.ID === requestData.categoryID
  //       )
  //     } : null
  //   };
  //
  //   replaceArrayElementsByPredicates(
  //     this.categories,
  //     new Map<(category: Category) => boolean, Category>([
  //       [ (category: Category): boolean => category.ID === requestData.ID, updatedProduct ]
  //     ]),
  //     { mutably: true }
  //   );
  // }
  //
  // public deleteProduct(targetProductID: Product.ID): void {
  //   removeArrayElementsByPredicates(
  //     this.products,
  //     (product: Product): boolean => product.ID === targetProductID,
  //     { mutably: true }
  //   );
  // }
}
