import type Article from "../BusinessRules/Enterprise/Article";
import {
  Controller,
  TemplateEngine
} from "../../../../Source";
import type {
  Request,
  Response
} from "../../../../Source";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


export default class ArticleController extends Controller {

  private readonly renderProductsPage: TemplateEngine.CachedRenderer<ArticleController.ProductsListPage.TemplateParameters> =
      TemplateEngine.cacheRenderer("Views/Sample.hbs");

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "articles"
  })
  public async generateProductsPage(_request: Request, response: Response): Promise<void> {
    return response.submitWithSuccess({
      HTML_Content: this.renderProductsPage({
        topHeading: "Test",
        articles: [
          { title: "Article1", URI: "#" },
          { title: "Article2", URI: "#" }
        ],
        sampleBooleanVariable: true
      })
    });
  }
}


namespace ArticleController {

  export namespace ProductsListPage {

    export type TemplateParameters = {
      topHeading: string;
      articles: Array<Article>;
      sampleBooleanVariable: true;
    };
  }
}
