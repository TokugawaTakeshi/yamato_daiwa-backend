import FrontEndDependenciesInjector from "../../../../../../../../../../../../計画/〔ECMAScript系開発〕 自動化/テスト用プロジェクト/FullStackWebApplication-NodeJS/01-FrontEnd/02-InteractiveImplementation/FrontEndApplicationDependencies";

/* --- 企業のビジネスルール ----------------------------------------------------------------------------------------------- */
import Product from "../../../../../00-BusinessRules/Enterprise/Product";

/* --- データ --------------------------------------------------------------------------------------------------------- */
import ProductGateway from "../../../../../00-Gateways/ProductGateway";
import store from "../../../../../../../../../../../../計画/〔ECMAScript系開発〕 自動化/テスト用プロジェクト/FullStackWebApplication-NodeJS/01-FrontEnd/02-InteractiveImplementation/StateManagement/store";

/* --- フレームワーク ----------------------------------------------------------------------------------------------------- */
import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators";

/* --- 補助 ---------------------------------------------------------------------------------------------------------- */
import {
  isNotNull,
  Logger,
  DataRetrievingFailedError
} from "hikari-es-extensions";


@Module({
  name: "PRODUCTS_MANAGER",
  dynamic: true,
  namespaced: true,
  store
})
class ProductsManagerStoreModule extends VuexModule {

  /* --- 標本取得 ---------------------------------------------------------------------------------------------------- */
  private _waitingForSelectionFirstRetrievingRequest: boolean = true;
  private _selectionIsBeingRetrievedNow: boolean = false;
  private _selectionRetrievingErrorOccurred: boolean = false;

  private _selection__actualForSpecifiedPaginationPage: Array<Product> = [];
  private _selectionItemsCount: number = 0;
  private _totalItemsCount: number = 0;

  private _activeFilteringAndSorting: ProductsManagerStoreModule.FilteringAndSorting =
      ProductsManagerStoreModule.defaultFilteringAndSorting;

  private static readonly defaultFilteringAndSorting: ProductsManagerStoreModule.FilteringAndSorting = {
    paginationPageNumber: 1,
    itemsPerPaginationPage: 20,
    name__partialOrFull: null
  };


  @Action
  public async fetchSelection(
      {
        paginationPageNumber = this._activeFilteringAndSorting.paginationPageNumber,
        itemsPerPaginationPage = this._activeFilteringAndSorting.itemsPerPaginationPage,
        name__partialOrFull = this._activeFilteringAndSorting.name__partialOrFull
      }: Partial<ProductsManagerStoreModule.FilteringAndSorting>
  ): Promise<void> {

    this.onSelectionRetrievingStarted();

    try {

      this.onSelectionRetrievingSucceeded({
        responseData: await FrontEndDependenciesInjector.gateways.product.retrieveSelection({
          paginationPageNumber,
          itemsPerPaginationPage,
          ...isNotNull(name__partialOrFull) ? { filteringByName: name__partialOrFull } : {}
        }),
        updatedFilteringAndSorting: {
          paginationPageNumber,
          itemsPerPaginationPage,
          name__partialOrFull
        }
      });

    } catch (error: unknown) {

      this.onSelectionRetrievingFailed();

      Logger.throwErrorAndLog({
        errorInstance: new DataRetrievingFailedError({ mentionToData: "商品一覧" }),
        occurrenceLocation: "categoriesManagerStoreModule.retrieveSelection(parametersObject)",
        title: DataRetrievingFailedError.DEFAULT_TITLE,
        wrappableError: error
      });
    }
  }


  @Mutation
  private onSelectionRetrievingStarted(): void {
    this._waitingForSelectionFirstRetrievingRequest = false;
    this._selectionIsBeingRetrievedNow = true;
    this._selectionRetrievingErrorOccurred = false;
  }

  @Mutation
  private onSelectionRetrievingSucceeded(
      {
        responseData,
        updatedFilteringAndSorting
      }: {
        responseData: ProductGateway.SelectionRetrieving.ResponseData;
        updatedFilteringAndSorting: ProductsManagerStoreModule.FilteringAndSorting;
      }
  ): void {

    this._selection__actualForSpecifiedPaginationPage = responseData.selection__actualForSpecifiedPaginationPage;

    this._selectionItemsCount = responseData.selectionItemsCount;
    this._totalItemsCount = responseData.totalItemsCount;

    this._activeFilteringAndSorting = updatedFilteringAndSorting;

    this._selectionIsBeingRetrievedNow = false;
    this._selectionRetrievingErrorOccurred = false;
  }

  @Mutation
  private onSelectionRetrievingFailed(): void {
    this._selectionRetrievingErrorOccurred = true;
    this._selectionIsBeingRetrievedNow = false;
  }


  public get selectionIsBeingRetrievedNowOrRetrievingWillBeginShortly(): boolean {
    return this._waitingForSelectionFirstRetrievingRequest || this._selectionIsBeingRetrievedNow;
  }

  public get selectionRetrievingErrorOccurred(): boolean {
    return this._selectionRetrievingErrorOccurred;
  }

  public get totalItemsCount(): number {
    return this._totalItemsCount;
  }

  public get selectionItemsCount(): number {
    return this._selectionItemsCount;
  }

  public get selection__actualForSpecifiedPaginationPage(): Array<Product> {
    return this._selection__actualForSpecifiedPaginationPage;
  }
}


namespace ProductsManagerStoreModule {

  export type FilteringAndSorting = {
    readonly paginationPageNumber: number;
    readonly itemsPerPaginationPage: number;
    readonly name__partialOrFull: string | null;
  };
}


export default ProductsManagerStoreModule;
