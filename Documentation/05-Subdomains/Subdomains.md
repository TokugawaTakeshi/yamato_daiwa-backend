# Subdomains
## Minimal theory

In URI `https://yamatodaiwa.com/`:

* `yamatodaiwa.com` is a **host name**
* `com` is a [top-level domain](https://en.wikipedia.org/wiki/Top-level_domain) (TLD)
* `yamatodaiwa` is a [second-level domain](https://en.wikipedia.org/wiki/Second-level_domain) (SLD)

There also could be the third-level domain and so on.

* **Subdomain** is the domain of third level and deeper.
* The **labels** are the values between dots in domain. 
* The maximal subdomains count is **127** but maximal symbols count of all subdomains is **255**.
* The single subdomain could have maximum **63** symbols.
* The service providers could set more strict limitations.

The subdomains could be served by single or multiple application instances, virtual or physical servers.


### Frequent patterns of subdomains usage

#### One product/service per subdomain

The Google (`google.com`) has the subdomain for each service, for example:

* `calendar.google.com` - for Google Calendar application
* `photos.google.com` - for Google Photos application
* `docs.google.com` - for Google Docs application

and so on.


#### Localization

The VueJS framework documentation has no subdomain (`vuejs.org`) for default language - English.
For the translations, the subdomains are being used:

* `cn.vuejs.org` - for Chinese
* `jp.vuejs.org` - for Japanese
* `kr.vuejs.org` - for Korean

and so on.


### Subdomains in native Node.js

To understand which subdomain has been requested it's required to check the `HOST` HTTP header.
The Node.js documentation assumes that this header definitely exists:

> ```javascript
> new URL(request.url, `http://${request.headers.host}`);
> ```
>
> Source: [Node.js documentation](https://nodejs.org/api/http.html#http_message_url)

However, according the TypeScript types definitions this header could be asn `undefined` (same as `request.url`):

```typescript
interface IncomingHttpHeaders extends NodeJS.Dict<string | string[]> {
  // ...
  host?: string | undefined;
  // ...
}
```

If `request.headers.host` are defined, it's possible to provide the subdomain-dependent response.


## Subdomains in `@yamato-daiwa/backend`

If `subdomains` property has not been defined as in previous tutorials, it means that no subdomain-dependent logic 
will be supported.

```typescript
Server.initializeAndStart({
  
  host: "127.0.0.1",
  HTTP: { port: 1337 },
  
  routing: [ /* */ ]
  
  // subdomains: {}
});
```


Now let's consider the implementation of common scenarios with subdomains.


### Adding the locale for main domain

Suppose we have `example.com` domain and want to provide the localization via subdomains.
Let's decide which locales we will be support and define some subdomain-dependent logic in the route handler.

```typescript
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
```

In the server configuration, `routing` property is required - it will be used when no subdomain or `HOST` header specified.
Additionally, we need to define the `subomains` property, the associative array.

* The key of this array is a host name template from the 3rd level domain (in other example - it's just a locale). 
  As in routing, the parameter must be annotated by prepended colon (stored to constant `nameTemplate` in our example).
* The value is an object. It has multiple optional properties, but now we need only a `routing`. 

```typescript
Server.initializeAndStart({
  host: "127.0.0.1",
  HTTP: { port: 1337 },
  routing: Hosts.Main.routing,
  subdomains: {
    [`${Hosts.Main.nameTemplate}`]: { routing: Hosts.Main.routing }
  }
});
```


### Adding of the specific subdomain

Now assume that `example.com` has the calendar application at `calendar.example.com`.
Let's leave the previous example to make sure that static label `calendar` does not conflict with languages.

```typescript
namespace Hosts {
  
  export namespace Main { /* The code from the previous example */ }

  export namespace Calendar {

    export const name: string = "calendar";

    /* For the real application, below handler should be somewhere else, e. g. in controller. */
    export const routing: Router.RawRouting = [
      {
        route: { type: HTTP_Methods.get, pathTemplate: "/" },
        async handler(_request: Request, response: Response): Promise<void> {
          return response.submit({
            statusCode: HTTP_StatusCodes.OK,
            HTML_Content: "<h1>Here will be the 'Calendar' application in the future!</h1>"
          });
        }
      }
    ];
  }
}

Server.initializeAndStart({
  host: "127.0.0.1",
  HTTP: { port: 1337 },
  routing: Hosts.Main.routing,
  subdomains: {
    [`${Hosts.Main.nameTemplate}`]: { routing: Hosts.Main.routing },
    [`${Hosts.Calendar.name}`]: { routing: Hosts.Calendar.routing }
  }
});
```

Now call `http://localhost:1337/` with `Host` header set to `calendar.example.com`.


Now let's add the optional localization for the `calendar.example.com`.
We'll keep all previous logic to make sure that new logic does not conflict with previous;


```typescript
namespace Hosts {

  export namespace Main {/* /// */}

  export namespace Calendar {

    export enum NameParametersKeys {
      locale = "locale"
    }

    export const nameTemplate: string = `:${NameParametersKeys.locale}?.calendar`;

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
                case SupportedLocales.english: return "<h1>Here will be the 'Calendar' application in the future!</h1>";
                case SupportedLocales.japanese: return "<h1>将来にここで「カレンダー」アプリができます！</h1>";
                case SupportedLocales.chinese: return "<h1>這裡將是未來的“日曆”應用程序！</h1>";
                case SupportedLocales.korean: return "<h1>앞으로 '캘린더' 애플리케이션이 여기에 있습니다!</h1>";
                case SupportedLocales.russian: return "<h1>В будущем здесь будет приложение 'Календарь'!</h1>";
              }
            })()
          });
        }
      }
    ];
  }
}


Server.initializeAndStart({
  host: "127.0.0.1",
  HTTP: { port: 1337 },
  routing: Hosts.Main.routing,
  subdomains: {
    [`${Hosts.Main.nameTemplate}`]: { routing: Hosts.Main.routing },
    [`${Hosts.Calendar.nameTemplate}`]: { routing: Hosts.Calendar.routing }
  }
});
```

Test for `calendar.example.com`:


