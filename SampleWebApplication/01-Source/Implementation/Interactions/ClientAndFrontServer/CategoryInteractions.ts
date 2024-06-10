import type Category from "@Entities/Category";

import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


namespace CategoryInteractions {

  export namespace SelectionRetrieving {

    export const HTTP_METHOD: HTTP_Methods = HTTP_Methods.get;

    export const URI_PATH: string = "api/categories";

    export type QueryParameters = Readonly<{
      paginationPageNumber: number;
      itemsCountPerPaginationPage: number;
      searchingByFullOrPartialName?: string;
    }>;

    export namespace QueryParameters {
      export namespace SearchingByFullOrPartialName {
        export const MINIMAL_CHARACTERS_COUNT: number = 2;
      }
    }
  }

  export namespace RetrievingByID {

    export const HTTP_METHOD: HTTP_Methods = HTTP_Methods.get;

    export namespace URI_Path {

      export type Parameters = Readonly<{ categoryID: string; }>;

      export namespace Parameters {
        export enum Names {
          categoryID = "categoryID"
        }
      }

      export function build({ targetCategoryID }: { targetCategoryID: Category.ID; }): string {
        return `/api/categories/${ targetCategoryID }`;
      }

      export const TEMPLATE: string = build({ targetCategoryID: `:${ Parameters.Names.categoryID }` });
    }
  }
}


export default CategoryInteractions;
