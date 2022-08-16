/* --- Entities ----------------------------------------------------------------------------------------------------- */
import type Product from "@Entities/Product";

/* --- Gateways ----------------------------------------------------------------------------------------------------- */
import type ProductGateway from "@Gateways/ProductGateway";

/* --- Data --------------------------------------------------------------------------------------------------------- */
import MockDataSource from "@MockDataSource/MockDataSource";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import {
  MockGatewayHelper,
  getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne,
  splitToPaginationCollection,
  isNotUndefined
} from "@yamato-daiwa/es-extensions";


export default class ProductMockGateway implements ProductGateway {

  private readonly mockDataSource: MockDataSource = MockDataSource.getInstance();


  public async retrieveSelection(
    requestParameters: ProductGateway.SelectionRetrieving.RequestParameters
  ): Promise<ProductGateway.SelectionRetrieving.ResponseData> {

    let selection: Array<Product> = this.mockDataSource.products;

    if (isNotUndefined(requestParameters.searchingByFullOrPartialName)) {
      const searchingByFullOrPartialName: string = requestParameters.searchingByFullOrPartialName;
      selection = selection.filter(
        (product: Product): boolean => product.name.includes(searchingByFullOrPartialName)
      );
    }

    return MockGatewayHelper.simulateDataRetrieving({
      requestParameters,
      getResponseData: (): ProductGateway.SelectionRetrieving.ResponseData => ({
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
      gatewayName: "ProductMockGateway",
      transactionName: "retrieveSelection"
    });

  }

  public async retrieveByID(targetProductID: Product.ID): Promise<Product> {
    return MockGatewayHelper.simulateDataRetrieving({
      requestParameters: targetProductID,
      getResponseData: (): Product => getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne(
        this.mockDataSource.products,
        (product: Product): boolean => product.ID === targetProductID,
        { mustThrowErrorIfElementNotFoundOrMoreThan1: true }
      ),
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "ProductMockGateway",
      transactionName: "retrieveByID"
    });
  }

  public async add(
    requestData: ProductGateway.Adding.RequestData
  ): Promise<ProductGateway.Adding.AddedProductID> {
    return MockGatewayHelper.simulateDataSubmitting({
      requestData,
      getResponseData: (): ProductGateway.Adding.AddedProductID => this.mockDataSource.addProduct(requestData),
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "ProductMockGateway",
      transactionName: "add"
    });
  }

  public async update(updatedProduct: ProductGateway.Updating.RequestData): Promise<void> {
    return MockGatewayHelper.simulateDataSubmitting({
      requestData: updatedProduct,
      getResponseData: (): void => { this.mockDataSource.updateProduct(updatedProduct); },
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "ProductMockGateway",
      transactionName: "update"
    });
  }

  public async delete(targetProductID: Product.ID): Promise<void> {
    return MockGatewayHelper.simulateDataSubmitting({
      requestData: targetProductID,
      getResponseData: (): void => { this.mockDataSource.deleteProduct(targetProductID); },
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "ProductMockGateway",
      transactionName: "delete"
    });
  }

}
