/* --- Entities ----------------------------------------------------------------------------------------------------- */
import type Category from "@Entities/Category";

/* --- Gateways ----------------------------------------------------------------------------------------------------- */
import type CategoryGateway from "@Gateways/CategoryGateway";

/* --- Data --------------------------------------------------------------------------------------------------------- */
import MockDataSource from "@MockDataSource/MockDataSource";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import {
  MockGatewayHelper,
  getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne,
  splitToPaginationCollection,
  isNotUndefined
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

    return MockGatewayHelper.simulateDataRetrieving({
      requestParameters,
      getResponseData: (): CategoryGateway.SelectionRetrieving.ResponseData => ({
        selectionItemsCount: selection.length,
        totalItemsCount: this.mockDataSource.categories.length,
        itemsOfTargetPaginationPage: splitToPaginationCollection(selection, {
          itemsCountPerPaginationPage: requestParameters.itemsCountPerPaginationPage,
          pagesNumerationFrom: 1
        }).getItemsForPage(requestParameters.paginationPageNumber)
      }),
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "CategoryMockGateway",
      transactionName: "retrieveSelection"
    });

  }

  public async retrieveByID(targetCategoryID: Category.ID): Promise<Category> {
    return MockGatewayHelper.simulateDataRetrieving({
      requestParameters: targetCategoryID,
      getResponseData: (): Category => getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne(
        this.mockDataSource.categories,
        (category: Category): boolean => category.ID === targetCategoryID,
        { mustThrowErrorIfElementNotFoundOrMoreThan1: true }
      ),
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "CategoryMockGateway",
      transactionName: "retrieveByID"
    });
  }

  public async add(requestData: CategoryGateway.Adding.RequestData): Promise<CategoryGateway.Adding.AddedCategoryID> {
    return MockGatewayHelper.simulateDataSubmitting({
      requestData,
      getResponseData: (): CategoryGateway.Adding.AddedCategoryID => this.mockDataSource.addCategory(requestData),
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "CategoryMockGateway",
      transactionName: "add"
    });
  }

  public async update(updatedCategory: Category): Promise<void> {
    return MockGatewayHelper.simulateDataSubmitting({
      requestData: updatedCategory,
      getResponseData: (): void => { this.mockDataSource.updateCategory(updatedCategory); },
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "CategoryMockGateway",
      transactionName: "update"
    });
  }

  public async delete(targetCategoryID: Category.ID): Promise<void> {
    return MockGatewayHelper.simulateDataSubmitting({
      requestData: targetCategoryID,
      getResponseData: (): void => { this.mockDataSource.deleteCategory(targetCategoryID); },
       mustSimulateError: false,
       minimalPendingPeriod__seconds: 1,
       maximalPendingPeriod__seconds: 2,
       gatewayName: "CategoryMockGateway",
       transactionName: "delete"
    });
  }

}
