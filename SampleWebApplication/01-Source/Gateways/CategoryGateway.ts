import type Category from "@EnterpriseBusinessRules/Category";


interface CategoryGateway {

  retrieveSelection: (
    requestParameters: CategoryGateway.SelectionRetrieving.RequestParameters
  ) => Promise<CategoryGateway.SelectionRetrieving.ResponseData>;

  retrieveByID: (targetCategoryID: string) => Promise<Category>;

  add: (requestParameters: CategoryGateway.Adding.RequestData) => Promise<CategoryGateway.Adding.AddedCategoryID>;

  update: (updatedCategory: Category) => Promise<void>;

  delete: (targetCategoryID: Category.ID) => Promise<void>;
}


namespace CategoryGateway {

  export namespace SelectionRetrieving {

    export type RequestParameters = {
      readonly paginationPageNumber: number;
      readonly itemsCountPerPaginationPage: number;
      readonly searchingByFullOrPartialName?: string;
    };

    export type ResponseData = {
      readonly selection__actualForSpecifiedPaginationPage: Array<Category>;
      readonly selectionItemsCount: number;
      readonly totalItemsCount: number;
    };
  }

  export namespace Adding {

    export type RequestData = Pick<Category, "name">;

    export type AddedCategoryID = Category.ID;
  }
}


export default CategoryGateway;
