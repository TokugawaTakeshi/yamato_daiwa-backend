import { Request, Response, Controller, TemplateEngine } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";
import Product from "../BusinessRules/Product";


export default class ProductController extends Controller {

  private static productsPageRenderer: TemplateEngine.CachedRenderer<ProductController.ProductsListPage.Data> =
      TemplateEngine.cacheRenderer("Views/ProductsListPage.template.pug")

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products"
  })
  public async generateProductsPage(_request: Request, response: Response): Promise<void> {
    return response.submitWithSuccess({
      HTML_Content: ProductController.productsPageRenderer({
        hasUserBeenAuthenticated: true,
        products: [
          {
            title: "Foo",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut " +
                "labore et dolore magna aliqua.",
            thumbnailURI: "https://dummyimage.com/600x400/FFCCBC/000",
            price__dollars: 5
          },
          {
            title: "Bar",
            description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            thumbnailURI: "https://dummyimage.com/600x400/ffecb3/000",
            price__dollars: 10
          },
          {
            title: "Baz",
            description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            thumbnailURI: "https://dummyimage.com/600x400/C8E6C9/000",
            price__dollars: 20
          },
          {
            title: "Hoge",
            description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            thumbnailURI: "https://dummyimage.com/600x400/B3E5FC/000",
            price__dollars: 25
          },
          {
            title: "Fuga",
            description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, " +
                "totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
            thumbnailURI: "https://dummyimage.com/600x400/D1C4E9/000",
            price__dollars: 30
          }
        ]
      })
    });
  }
}


namespace ProductController {

  export namespace ProductsListPage {

    export type Data = Readonly<{
      hasUserBeenAuthenticated: boolean;
      products: Array<Product>;
    }>;

  }

}
