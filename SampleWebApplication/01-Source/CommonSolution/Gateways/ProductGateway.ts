import type Product from "@Entities/Product";
import type Category from "@Entities/Category";


interface ProductGateway {

  retrieveSelection: (
    requestParameters: ProductGateway.SelectionRetrieving.RequestParameters
  ) => Promise<ProductGateway.SelectionRetrieving.ResponseData>;

  retrieveByID: (targetProductID: Product.ID) => Promise<Product>;

  add: (requestData: ProductGateway.Adding.RequestData) => Promise<ProductGateway.Adding.AddedProductID>;

  update: (updatedProduct: ProductGateway.Updating.RequestData) => Promise<void>;

  delete: (targetProductID: Product.ID) => Promise<void>;

}


namespace ProductGateway {

  export namespace SelectionRetrieving {

    export type RequestParameters = Readonly<{
      paginationPageNumber: number;
      itemsCountPerPaginationPage: number;
      searchingByFullOrPartialName?: string;
    }>;

    export type ResponseData = Readonly<{
      itemsOfTargetPaginationPage: Array<Product>;
      selectionItemsCount: number;
      totalItemsCount: number;
    }>;

  }

  export namespace Adding {
    export type RequestData = Readonly<Omit<Product, "ID">>;
    export type AddedProductID = Product.ID;
  }

  export namespace Updating {
    export type RequestData = Readonly<
      Pick<Product, "ID"> &
      Partial<Omit<Product, "ID" | "category">> &
      { categoryID: Category.ID; }
    >;
  }

}


export default ProductGateway;
