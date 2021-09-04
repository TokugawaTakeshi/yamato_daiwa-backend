import { Server, Request, Response, Router } from "@yamato-daiwa/backend";
import { HTTP_Methods, HTTP_StatusCodes, isUndefined, isElementOfEnumeration } from "@yamato-daiwa/es-extensions";


namespace Hosts {

  export namespace Main {

    export enum NameParametersKeys {
      locale = "locale"
    }

    export const nameTemplate: string = `:${NameParametersKeys.locale}`;

    export enum SupportedLocales {
      english = "en",
      japanese = "ja",
      chinese = "ch",
      korean = "ko",
      russian = "ru"
    }

    export const DEFAULT_LOCALE: SupportedLocales = SupportedLocales.english;

    /* For the real application, below handler should be somewhere else, e. g. in controller. */
    export const routing: Router.RawRouting = [
      {
        route: { type: HTTP_Methods.get, pathTemplate: "/" },
        async handler(request: Request, response: Response): Promise<void> {

          let locale: SupportedLocales;

          if (isUndefined(request.subdomainParameters.locale)) {
            locale = DEFAULT_LOCALE;
          } else if (isElementOfEnumeration(request.subdomainParameters.locale, SupportedLocales)) {
            locale = request.subdomainParameters.locale;
          } else {
            locale = DEFAULT_LOCALE;
          }

          return response.submit({
            statusCode: HTTP_StatusCodes.OK,
            HTML_Content: ((): string => {
              switch (locale) {
                case SupportedLocales.english: return "<h1>Welcome!</h1>";
                case SupportedLocales.japanese: return "<h1>ようこそ！</h1>";
                case SupportedLocales.chinese: return "<h1>歡迎！</h1>";
                case SupportedLocales.korean: return "<h1>환영하다！</h1>";
                case SupportedLocales.russian: return "<h1>Добро пожаловать！</h1>";
              }
            })()
          });
        }
      }
    ];
  }
}


/* Running the test:
*  npx nodemon 05-Subdomains/Example/OneDynamicSubdomain.example.ts
* */
Server.initializeAndStart({
  host: "127.0.0.1",
  HTTP: { port: 1337 },
  routing: Hosts.Main.routing,
  subdomains: {
    [`${Hosts.Main.nameTemplate}`]: { routing: Hosts.Main.routing }
  }
});
