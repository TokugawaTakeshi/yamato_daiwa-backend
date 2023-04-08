/* --- Entities ----------------------------------------------------------------------------------------------------- */
import type Category from "@Entities/Category";
import type Product from "@Entities/Product";

/* --- Data --------------------------------------------------------------------------------------------------------- */
import MockDataSource from "@MockDataSource/MockDataSource";


const mockDataSource: MockDataSource = MockDataSource.getInstance();


const MockData: Readonly<{
  categories: ReadonlyArray<Category>;
  products: ReadonlyArray<Product>;
}> = {
  categories: mockDataSource.categories,
  products: mockDataSource.products
};


export default MockData;
