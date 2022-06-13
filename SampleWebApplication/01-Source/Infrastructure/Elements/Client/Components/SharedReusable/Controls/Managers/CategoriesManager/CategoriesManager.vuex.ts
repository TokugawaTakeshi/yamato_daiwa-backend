import FrontEndDependenciesInjector from "../../../../../../../../../../../../計画/〔ECMAScript系開発〕 自動化/テスト用プロジェクト/FullStackWebApplication-NodeJS/01-FrontEnd/02-InteractiveImplementation/FrontEndApplicationDependencies";

/* --- 企業のビジネスルール ----------------------------------------------------------------------------------------------- */
import Category from "../../../../../00-BusinessRules/Enterprise/Category";

/* --- データ --------------------------------------------------------------------------------------------------------- */
import CategoryGateway from "../../../../../00-Gateways/CategoryGateway";
import store from "../../../../../../../../../../../../計画/〔ECMAScript系開発〕 自動化/テスト用プロジェクト/FullStackWebApplication-NodeJS/01-FrontEnd/02-InteractiveImplementation/StateManagement/store";

/* --- フレームワーク ---------------------------------------------------------------------------------------------------- */
import {
  Module as VuexModuleConfiguration,
  VuexModule,
  Action as VuexAction,
  Mutation as VuexMutation,
  getModule as getVuexModule
} from "vuex-module-decorators";

/* --- 補助 ---------------------------------------------------------------------------------------------------------- */
import {
  isNotNull,
  Logger,
  DataRetrievingFailedError
} from "hikari-es-extensions";


@VuexModuleConfiguration({
  name: "CategoriesManagerService",
  dynamic: true,
  namespaced: true,
  store
})
class CategoriesManagerService extends VuexModule {

  public static getInstance(): CategoriesManagerService {
    return getVuexModule(CategoriesManagerService);
  }

  /* === 標本取得 ==================================================================================================== */
  private _isWaitingForSelectionRetrievingStart: boolean = true;
  private _isSelectionBeingRetrievedNow: boolean = false;
  private _wasSelectionRetrievingErrorOccurred: boolean = false;

  private _selection__actualForSpecifiedPaginationPage: Array<Category> = [];
  private _selectionItemsCount: number = 0;
  private _totalItemsCount: number = 0;

  private _activeFilteringAndSorting: CategoriesManagerService.FilteringAndSorting =
      CategoriesManagerService.defaultFilteringAndSorting;

  private static readonly defaultFilteringAndSorting: CategoriesManagerService.FilteringAndSorting = {
    paginationPageNumber: 1,
    itemsPerPaginationPage: 20,
    searchingByName: null
  };


  @VuexAction
  public async retrieveSelection(
    {
      paginationPageNumber = this._activeFilteringAndSorting.paginationPageNumber,
      itemsPerPaginationPage = this._activeFilteringAndSorting.itemsPerPaginationPage,
      searchingByName = this._activeFilteringAndSorting.searchingByName
    }: Partial<CategoriesManagerService.FilteringAndSorting>
  ): Promise<void> {

    this.onSelectionRetrievingStarted({
      paginationPageNumber,
      itemsPerPaginationPage,
      searchingByName
    });

    try {

      this.onSelectionRetrievingSucceeded(await FrontEndDependenciesInjector.gateways.category.retrieveSelection({
        paginationPageNumber,
        itemsPerPaginationPage,
        ...isNotNull(searchingByName) ? { searchingByName } : {}
      }));

    } catch (error: unknown) {

      this.onSelectionRetrievingFailed();

      Logger.throwErrorAndLog({
        errorInstance: new DataRetrievingFailedError({ mentionToData: "商品カテゴリー一覧" }),
        occurrenceLocation: "categoriesManagerStoreModule.retrieveSelection(parametersObject)",
        title: DataRetrievingFailedError.DEFAULT_TITLE,
        wrappableError: error
      });
    }
  }


  @VuexMutation
  private onSelectionRetrievingStarted(newFilteringAndSorting: CategoriesManagerService.FilteringAndSorting): void {

    this._isWaitingForSelectionRetrievingStart = false;
    this._isSelectionBeingRetrievedNow = true;
    this._wasSelectionRetrievingErrorOccurred = false;

    this._activeFilteringAndSorting = newFilteringAndSorting;
  }

  @VuexMutation
  private onSelectionRetrievingSucceeded(responseData: CategoryGateway.SelectionRetrieving.ResponseData): void {

    this._selection__actualForSpecifiedPaginationPage = responseData.selection__actualForSpecifiedPaginationPage;

    this._selectionItemsCount = responseData.selectionItemsCount;
    this._totalItemsCount = responseData.totalItemsCount;

    this._isSelectionBeingRetrievedNow = false;
  }

  @VuexMutation
  private onSelectionRetrievingFailed(): void {
    this._wasSelectionRetrievingErrorOccurred = true;
    this._isSelectionBeingRetrievedNow = false;
  }


  public get selectionIsBeingRetrievedNowOrRetrievingWillBeginShortly(): boolean {
    return this._isWaitingForSelectionRetrievingStart || this._isSelectionBeingRetrievedNow;
  }

  public get wasSelectionRetrievingErrorOccurred(): boolean {
    return this._wasSelectionRetrievingErrorOccurred;
  }

  public get totalItemsCount(): number {
    return this._totalItemsCount;
  }

  public get selectionItemsCount(): number {
    return this._selectionItemsCount;
  }

  public get selection__actualForSpecifiedPaginationPage(): Array<Category> {
    return this._selection__actualForSpecifiedPaginationPage;
  }


  /* === 一件取得 ==================================================================================================== */


  /* === 追加 ======================================================================================================= */
  // public addCategory(requestData: CategoryGateway.Adding.RequestData): Promise<CategoryGateway.Adding.AddedCategoryID> {
  //
  // }
}


namespace CategoriesManagerService {

  export type FilteringAndSorting = {
    readonly paginationPageNumber: number;
    readonly itemsPerPaginationPage: number;
    readonly searchingByName: string | null;
  };
}


export default CategoriesManagerService;
