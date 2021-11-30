import Product from "@EnterpriseBusinessRules/Product";
import Category from "@EnterpriseBusinessRules/Category";


interface ProductGateway {

  retrieveSelection: (
    requestParameters: ProductGateway.SelectionRetrieving.RequestParameters
  ) => Promise<ProductGateway.SelectionRetrieving.ResponseData>;

  retrieveByID: (targetProductID: string) => Promise<Product>;

  add: (requestData: ProductGateway.Adding.RequestData) => Promise<ProductGateway.Adding.AddedProductID>;

  update: (updatedProduct: ProductGateway.Updating.RequestData) => Promise<void>;

  delete: (targetProductID: string) => Promise<void>;
}


namespace ProductGateway {

  export namespace SelectionRetrieving {

    export type RequestParameters = {
      paginationPageNumber: number;
      itemsCountPerPaginationPage: number;
      searchingByFullOrPartialName?: string;
    };

    export type ResponseData = {
      selection__actualForSpecifiedPaginationPage: Array<Product>;
      selectionItemsCount: number;
      totalItemsCount: number;
    };
  }

  export namespace Adding {
    export type RequestData = Omit<Product, "ID">;
    export type AddedProductID = Product.ID;
  }

  export namespace Updating {
    export type RequestData = Partial<Omit<Product, "category">> & { categoryID: Category.ID; }; // TODO null
  }
}


export default ProductGateway;
