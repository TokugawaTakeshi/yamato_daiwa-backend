import type Category from "@Entities/Category";


interface CategoryGateway {

  retrieveSelection: (
    requestParameters: CategoryGateway.SelectionRetrieving.RequestParameters
  ) => Promise<CategoryGateway.SelectionRetrieving.ResponseData>;

  retrieveByID: (targetCategoryID: Category.ID) => Promise<Category>;

  add: (requestData: CategoryGateway.Adding.RequestData) => Promise<CategoryGateway.Adding.AddedCategoryID>;

  update: (updatedCategory: Category) => Promise<void>;

  delete: (targetCategoryID: Category.ID) => Promise<void>;

}


namespace CategoryGateway {

  export namespace SelectionRetrieving {

    export type RequestParameters = Readonly<{
      paginationPageNumber: number;
      itemsCountPerPaginationPage: number;
      searchingByFullOrPartialName?: string;
    }>;

    export type ResponseData = Readonly<{
      itemsOfTargetPaginationPage: Array<Category>;
      selectionItemsCount: number;
      totalItemsCount: number;
    }>;

  }

  export namespace Adding {
    export type RequestData = Readonly<Pick<Category, "name">>;
    export type AddedCategoryID = Category.ID;
  }

}


export default CategoryGateway;
