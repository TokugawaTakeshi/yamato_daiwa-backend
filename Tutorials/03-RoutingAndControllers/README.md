# Routing and controllers
## Theoretical minimum
### URL, URN, URI

The separation between **URL (Unified Resource Locator)**, **URN (Unified Resource Name)** and 
**URI (Unified Resource Identifier)** and also their decomposition is information-source dependent.
Although URL/URN/URI anatomy is framework independent fundamental pre-required knowledge,
we need to agree which terminology is actual for YDB framework.

First: we will not discuss differences between URL and URL, just note that **URI** is the fullest
entity including both of URL and URN (depending on information source, URL and URN parts could intersect or not).

Second, besides web, the URL/URN/URI is applicable to local file system. Although it has single conception,
here we are focused on web. 


### URI anatomy

Let us consider the significant parts of URIs. 
We need to know how we will use these parts rather than abstract canonical definitions, so below list is the descriptions,
not definitions.

[![](Images/URI%20decomposition.svg)]()

<dl>

  <dt>Protocol</dt>
  <dd>We are working with HTTP and HTTPS protocols.</dd>

  <dt>IP address</dt>
  <dd>
    For the local development case it will be local IP Address (usually 127.0.0.1). For the production case it will be 
    the IP address given by VPS or similar service provider.
  </dd>

  <dt>Domain</dt>
  <dd>
    The specifying of the domain is required mainly on production mode.
    Besides the technological aspect, the domain name is part of the branding.
    Developing the website or web application, we have to take care about domain could be easily replaced by another one.
  </dd>

  <dt>Port</dt>
  <dd>
    We need one, maximum 2 ports (for the supporting of both HTTP and HTTPS case) during developing of one site/application per VPS.
    If you want VPS server multiple application, it is required to use more ports.
  </dd>

  <dt>Origin</dt>
  <dd>
    Knowing this, anyone finally can visit your application. 
    Usually the origin refers to the top page of the site/application. 
  </dd>

  <dt>Path</dt>
  <dd>Routing is depending mainly on it. Usually it refers to specific HTML or JSON content.</dd>

  <dt>Query</dt>
  <dd>
    Frequently being used for the searching, filtering and so on.
    However it just a "usage guidelines" and we need to understand that programmer could implement any logic
    depending on query. Also note that query means nothing without associated route as context, by other words - path.
  </dd>

  <dt>Fragment / anchor</dt>
  <dd>This part is basically not being processed in server.</dd>
</dl>


### Routing

Now, when we agreed about URI anatomy, we can define the **routing**.
Please note that now we tell about routing _at server part_ - besides this routing, there could be the routing in client 
side, and it's concept is a little bit different.

**Routing** (at backend) is the conditional responding on requests from the client side depending on
URI (mainly from **path** and **query** parts) and HTTP method (GET, POST, etc.). Conditional responding is being
fully designed and coded by engineer for specific web application.

Here the example of the routing of typical corporate website:

| URI path      | What will be submitted with response                                                                                               |
|---------------|------------------------------------------------------------------------------------------------------------------------------------|
| /             | The HTML code of top page                                                                                                          |
| /about        | The HTML code of the page with the corporation's self-introduction                                                                 |
| /products     | The HTML code of the page with products of the corporation                                                                         |
| /products/:id | The HTML code of the internal landing page of specific product. Here the ":id" is ID of product; could be numerical or alphabetic. |
| /contact      | The HTML code of the path with contact form                                                                                        |

Besides these routes returning the HTML pages, responses with data (usually JSON) as known as **REST API** are more actual for today.
The path of these routes are being frequently starts with **api** segment, for example

| Request type | URI path          | What will be submitted with response                                                                                |
|--------------|-------------------|---------------------------------------------------------------------------------------------------------------------|
| GET          | /api/products     | The JSON array of products                                                                                          |
| GET          | /api/products/:id | The JSON object representing the single product. Here the ":id" is ID of product; could be numerical or alphabetic. |

> :memo: **Note:** 
> The routing must work regardless of origin. Normally, we have 2-4 environments (local development, testing,
> staging and production) each one with own origin, and also the companies could change the domain, split the big websites to
> multiple etc.


## Defining the routes in YDB

Routes could be defined, obviously and must be obviously in high-quality API, in **routing** property:

```typescript
import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";

Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  routing: [
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
      async handler(request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top page</h1>"
        });
      }
    },
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/products" },
      async handler(request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Products list</h1>"
        });
      }
    },
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/products/:ID" },
      async handler(request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: `<h1>Product with ID: ${request.routePathParameters.ID}</h1>`
        });
      }
    }
  ]
});
```

We used HTTP protocol to avoid the waisting of hte tutorial's time for SLL certificates, but for the web-sites/web applications
which will be published HTTPS is de facto required in 202X. You can switch to HTTPS in any stage of development until realize.

The **routing** property accepts the array of the objects **RouteAndHandlerPair** or controllers (will be explained below):

```typescript
export type RouteAndHandlerPair = { readonly route: Route; readonly handler: RouteHandler; };

export type Route = {
  readonly HTTP_Method: HTTP_Methods;
  readonly pathTemplate: string;
  readonly pathParameterProcessing?: RawObjectDataProcessor.PropertiesSpecification;
  readonly queryParametersProcessing?: RawObjectDataProcessor.PropertiesSpecification;
};

export type RouteHandler = (request: Request, response: Response) => Promise<void>;
```

* **pathTemplate** means that besides static URI path like `/foo/bar` the dynamic parameters like `:ID` in `/products/:ID` 
  case could be annotated.
* Prepended slashes could be omitted (`products/` is valid same as `/products/`).
* Appended slashes also could be omitted (`/products` or just `products` are valid same as `/products/`).

Start the server and visit `http://127.0.0.1:80/`, `http://127.0.0.1:80/products`, `http://127.0.0.1:80/products/1` pages
by the browser or HTTP client.


## Routing with controllers

Controllers are allowing to logically organize the requests.
Let's move the second and third route to the **ProductController**:

```typescript
import { Request, Response, Controller } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products"
  })
  public async generateProductsPage(_request: Request, response: Response): Promise<void> {
    return response.submitWithSuccess({
      HTML_Content: "<h1>Products list</h1>"
    });
  }

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products/:ID"
  })
  public async generateProductProfilePage(request: Request, response: Response): Promise<void> {
    return response.submitWithSuccess({
      HTML_Content: `<h1>Product with ID: ${request.routePathParameters.ID}</h1>`
    });
  }
}
```

Now all we need to make this routes available is pass `ProductController` as element of `routing` array:

```typescript
import ProductController from "./ProductController";

import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: {port: ProtocolDependentDefaultPorts.HTTP},
  routing: [
    {
      route: {HTTP_Method: HTTP_Methods.get, pathTemplate: "/"},
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top page</h1>"
        });
      }
    },
    ProductController
  ]
});
```

You even no need to create the instance of controller because the framework takes care about routine.
Why `Server` can extract the routes from the `ProductController` is `ProductController` has been inherited from
`Controller` class.
