import Article from "../BusinessRules/Enterprise/Article";

import {
  Controller,
  TemplateEngine,
  Request,
  Response
} from "../../../../Source";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


export default class ArticleController extends Controller {

  private readonly renderProductsPage: TemplateEngine.CachedRenderer<ArticleController.ProductsListPage.TemplateParameters> =
      TemplateEngine.cacheRenderer("Views/Sample.hbs");

  @Controller.RouteHandler({
    type: HTTP_Methods.get,
    pathTemplate: "articles"
  })
  public async generateProductsPage(request: Request, response: Response): Promise<void> {
    console.log(request);
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
