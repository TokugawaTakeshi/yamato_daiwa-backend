# Yamato Daiwa Backend 〔YDB〕

Back-end framework with build-in TypeScript type safety.
Intended to be used in full-stack applications where both client and server part written in TypeScript.

![Main visual of Yamato Daiwa Backend framework](https://user-images.githubusercontent.com/41653501/168190921-78edc07d-58cc-4298-8b59-182468cf280a.png)

* [Main package](MainPackage/README.md)
* [🌎 Issues](https://github.com/TokugawaTakeshi/yamato_daiwa-backend/issues)


## Installation

```
npm i @yamato-daiwa/backend -E
```


## Quick examples

> :warning: **Warning:** 
> Below examples has been developed to demonstrate the API of the framework such as easy to understand.
> For this, the splitting of the code to files and code itself has been minified, but this approach is unfit
> for the development of the real applications from the viewpoint of architecture.

### "Hello, world!"

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
          HTML_Content: "<h1>Hello, world!</h1>"
        });
      }
    }
  ]
});
```

See the ["Hello, world!"](Tutorials/01-HelloWorld/README.md) tutorial for the details.


### HTTPS support

```typescript
import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  HTTPS: {
    port: ProtocolDependentDefaultPorts.HTTPS,
    SSL_CertificateFileRelativeOrAbsolutePath: "SSL/cert.pem",
    SSL_KeyFileRelativeOrAbsolutePath: "SSL/key.pem"
  },
  routing: [
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Hello, world!</h1>"
        });
      }
    }
  ]
});
```
See the [HTTPS support](Tutorials/02-HTTPS_Support/README.md) tutorial for the details.


### Routing and controllers
#### Entry point

```typescript
import ProductController from "./ProductController";

import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  routing: [
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
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


#### Controller

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

See the [Routing and controllers](Tutorials/03-RoutingAndControllers/README.md) tutorial for the details.


### Strongly typed route path parameters

```typescript
import { Request, Response, Controller } from "@yamato-daiwa/backend";
import {
  HTTP_Methods,
  RawObjectDataProcessor,
  convertPotentialStringToNumberIfPossible
} from "@yamato-daiwa/es-extensions";


export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products/:ID",
    pathParametersProcessing: {
      ID: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
        type: Number,
        required: true,
        numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger
      }
    }
  })
  public async generateProductProfilePage(request: Request, response: Response): Promise<void> {

    const targetProductID: number = request.getProcessedRoutePathParameters<{ ID: number; }>().ID;

    return response.submitWithSuccess({
      HTML_Content: `<h1>Product with ID: ${targetProductID}</h1>`
    });
  }
}
```

See the [Strongly typed route path parameters](Tutorials/04-RoutePathParameters/README.md) tutorial for the details.


### Strongly type route query parameters

The query parameters default deserializer is [qs](https://www.npmjs.com/package/qs) with default configuration.

```typescript
import { Request, Response, Controller, BooleanParameterDefaultPreValidationModifier } from "@yamato-daiwa/backend";
import { HTTP_Methods, RawObjectDataProcessor, convertPotentialStringToNumberIfPossible } from "@yamato-daiwa/es-extensions";


export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "api/products",
    queryParametersProcessing: {
      
      paginationPageNumber: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
        type: Number,
        required: true,
        numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
      },
      itemsCountPerPaginationPage: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
        type: Number,
        required: true,
        numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
      },
      
      // Valid URL example:
      // http://127.0.0.1:80/api/products?forcedFiltering[makerID]=1&paginationPageNumber=1&itemsCountPerPaginationPage=20
      forcedFiltering: {
        type: Object,
        required: false,
        properties: {
          makerID: {
            preValidationModifications: convertPotentialStringToNumberIfPossible,
            type: Number,
            required: true,
            numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
          }
        }
      },
      
      consciousFiltering: {
        type: Object,
        required: false,
        properties: {
          fullOrPartialProductName: {
            type: String,
            required: false,
            minimalCharactersCount: 2
          },

          // Valid URL example:
          // http://127.0.0.1:80/api/products?consciousFiltering[outOfStock]=true&paginationPageNumber=1&itemsCountPerPaginationPage=20
          outOfStock: {
            preValidationModifications: BooleanParameterDefaultPreValidationModifier,
            type: Boolean,
            required: false
          },
          
          // Valid URL example:
          // http://127.0.0.1:80/api/products?consciousFiltering[categoriesIDs][0]=1&consciousFiltering[categoriesIDs][1]=2&paginationPageNumber=1&itemsCountPerPaginationPage=20
          categoriesIDs: {
            type: Array,
            required: false,
            element: {
              preValidationModifications: convertPotentialStringToNumberIfPossible,
              type: Number,
              numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
            }
          }
        }
      }
    }
  })
  public async retrieveProductsSelection(request: Request, response: Response): Promise<void> {

    const {
      paginationPageNumber,
      itemsCountPerPaginationPage,
      forcedFiltering,
      consciousFiltering
    }: {
      paginationPageNumber: number;
      itemsCountPerPaginationPage: number;
      forcedFiltering?: { makerID: number; };
      consciousFiltering?: { fullOrPartialProductName?: number; };
    } = request.getProcessedQueryParameters();

    console.log(request.URI);
    console.log(paginationPageNumber);
    console.log(itemsCountPerPaginationPage);
    console.log(forcedFiltering);
    console.log(consciousFiltering);

    
    // The specific data retrieving is not target of this example
    return response.submitWithSuccess({ JSON_Content: [] });
  }
}
```

See the [Strongly typed route query parameters](Tutorials/05-RouteQueryParameters/README.md) tutorial for the details.


### Dotenv config
#### Entry point

```typescript
import { Server, Request, Response } from "@yamato-daiwa/backend";
import { HTTP_Methods, RawObjectDataProcessor, convertPotentialStringToNumberIfPossible } from "@yamato-daiwa/es-extensions";
import { ObjectDataFilesProcessor } from "@yamato-daiwa/es-extensions-nodejs";


const configFromDotEnvFile: Readonly<{
  IP_ADDRESS: string;
  HTTP_PORT: number;
}> = ObjectDataFilesProcessor.processFile({
  filePath: ".env",
  schema: ObjectDataFilesProcessor.SupportedSchemas.DOTENV,
  validDataSpecification: {
    nameForLogging: "ConfigFromDotenvFile",
    subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
    properties: {
      IP_ADDRESS: {
        type: String,
        required: true
      },
      HTTP_PORT: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
        type: Number,
        numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger,
        required: true
      }
    }
  }
});


Server.initializeAndStart({
  IP_Address: configFromDotEnvFile.IP_ADDRESS,
  HTTP: { port: configFromDotEnvFile.HTTP_PORT },
  routing: [
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top page</h1>"
        });
      }
    }
  ]
});
```

#### Dotenv file

```dotenv
IP_ADDRESS=127.0.0.1
HTTP_PORT=80
```

See the [Dotenv config tutorial](Tutorials/06-DotenvConfig/README.md) for the details.


## Functionality tutorials

Please take the tutorials in following order.

<dl>

  <dt><a href="Tutorials/01-HelloWorld/README.md">Hello, world!</a></dt>
  <dd>Retrieving on HTML code by HTTP</dd>

  <dt><a href="Tutorials/02-HTTPS_Support/README.md">HTTPS support</a></dt>
  <dd>Serving of both <b>HTTP</b> and <b>HTTPS</b></dd>

  <dt><a href="Tutorials/03-RoutingAndControllers/README.md">Routing and controllers</a></dt>
  <dd>Defining the routing without and with controllers</dd>

  <dt><a href="Tutorials/04-RoutePathParameters/README.md">Strongly typed route path parameters</a></dt>
  <dd>Processing and type-safe accessing to route path parameters</dd>

  <dt><a href="Tutorials/05-RouteQueryParameters/README.md">Strongly typed route query parameters</a></dt>
  <dd>Processing and type-safe accessing to route query parameters</dd>

  <dt><a href="Tutorials/06-DotenvConfig/README.md">Dotenv config</a></dt>
  <dd>The retrieving of the configuration from the Dotenv files</dd>

</dl>
