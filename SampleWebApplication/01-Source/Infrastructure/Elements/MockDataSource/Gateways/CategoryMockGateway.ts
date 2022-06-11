/* --- Enterprise business rules ------------------------------------------------------------------------------------ */
import Category from "@EnterpriseBusinessRules/Category";

/* --- Data --------------------------------------------------------------------------------------------------------- */
import type CategoryGateway from "@Gateways/CategoryGateway";
import MockDataSource from "@MockDataSource/MockDataSource";

/* --- 補助 ---------------------------------------------------------------------------------------------------------- */
import MockGatewayHelper from "@Utils/MockGatewayHelper";
import {
  getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne,
  isNotUndefined,
  splitToPaginationCollection
} from "@yamato-daiwa/es-extensions";


export default class CategoryMockGateway implements CategoryGateway {

  private readonly mockDataSource: MockDataSource = MockDataSource.getInstance();


  public async retrieveSelection(
    requestParameters: CategoryGateway.SelectionRetrieving.RequestParameters
  ): Promise<CategoryGateway.SelectionRetrieving.ResponseData> {

    let selection: Array<Category> = this.mockDataSource.categories;

    if (isNotUndefined(requestParameters.searchingByFullOrPartialName)) {
      const searchingByFullOrPartialName: string = requestParameters.searchingByFullOrPartialName;
      selection = selection.filter(
        (category: Category): boolean => category.name.includes(searchingByFullOrPartialName)
      );
    }

    return MockGatewayHelper.simulateDataRetrieving(
      requestParameters,
      {
        selectionItemsCount: selection.length,
        totalItemsCount: this.mockDataSource.categories.length,
        selection__actualForSpecifiedPaginationPage: splitToPaginationCollection(selection, {
          itemsCountPerPaginationPage: requestParameters.itemsCountPerPaginationPage,
          pagesNumerationFrom: 1
        }).getItemsForPage(requestParameters.paginationPageNumber)
      },
      {
        simulateError: false,
        minimalPendingPeriod__seconds: 1,
        maximalPendingPeriod__seconds: 2,
        gatewayName: "CategoryMockGateway",
        transactionName: "retrieveSelection"
      }
    );
  }

  public async retrieveByID(targetCategoryID: string): Promise<Category> {
    return MockGatewayHelper.simulateDataRetrieving(
      targetCategoryID,
      getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne(
        this.mockDataSource.categories,
        (category: Category): boolean => category.ID === targetCategoryID,
        { throwErrorIfElementNotFoundOrMoreThan1: true }
      ),
      {
        simulateError: true,
        minimalPendingPeriod__seconds: 1,
        maximalPendingPeriod__seconds: 2,
        gatewayName: "CategoryMockGateway",
        transactionName: "retrieveByID"
      }
    );
  }

  public async add(requestData: CategoryGateway.Adding.RequestData): Promise<CategoryGateway.Adding.AddedCategoryID> {

    await MockGatewayHelper.simulateDataRetrieving(
      requestData,
      "(CategoryID)",
      {
        simulateError: false,
        minimalPendingPeriod__seconds: 1,
        maximalPendingPeriod__seconds: 2,
        gatewayName: "CategoryMockGateway",
        transactionName: "add"
      }
    );

    return this.mockDataSource.addCategory(requestData);
  }

  public async update(updatedCategory: Category): Promise<void> {

    await MockGatewayHelper.simulateDataSubmitting(
      updatedCategory,
      void 0,
      {
        simulateError: false,
        minimalPendingPeriod__seconds: 1,
        maximalPendingPeriod__seconds: 2,
        gatewayName: "CategoryMockGateway",
        transactionName: "update"
      }
    );

    this.mockDataSource.updateCategory(updatedCategory);
  }

  public async delete(targetCategoryID: Category.ID): Promise<void> {

    await MockGatewayHelper.simulateDataSubmitting(
      targetCategoryID,
      void 0,
      {
        simulateError: false,
        minimalPendingPeriod__seconds: 1,
        maximalPendingPeriod__seconds: 2,
        gatewayName: "CategoryMockGateway",
        transactionName: "delete"
      }
    );

    this.mockDataSource.deleteCategory(targetCategoryID);
  }
}
