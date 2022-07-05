import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


namespace ProductTransactions {

  export namespace SelectionRetrieving {

    export const HTTP_METHOD: HTTP_Methods = HTTP_Methods.get;

    export const URI_PATH: string = "api/products";

    export type QueryParameters = {
      paginationPageNumber: number;
      itemsCountPerPaginationPage: number;
      forcedFiltering?: {
        makerID: number;
      };
      consciousFiltering?: {
        fullOrPartialProductName?: string;
        outOfStock?: boolean;
        categoriesIDs?: Array<number>;
      }
    };
  }
}


export default ProductTransactions;
