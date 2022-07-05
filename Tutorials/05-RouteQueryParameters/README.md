# Route query parameters
## Native URLSearchParams interface

The **request** - first parameter of route handler - has the **URI** property of `Omit<URL, "hash">;` type where **URL**
[is the native class](https://developer.mozilla.org/en-US/docs/Web/API/URL). 
It has below properties related with query parameters.

<dl>
  <dt>search</dt>
  <dd>
    The string part of the URI beings from "?" and including all keys and values of query parameters.
    For example, in <code>http://127.0.0.1:80/products?paginationPage=2&itemsCountPerPaginationPage=20</code> case,
    it will be <code>?paginationPage=2&itemsCountPerPaginationPage=20</code>
  </dd>
  <dt>searchParams</dt>
  <dd>
    The object of <a href="https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams">URLSearchParams</a> type.
    For example, in <code>http://127.0.0.1:80/products?paginationPage=2&itemsCountPerPaginationPage=20</code> case,
    it will be <code>{ 'paginationPage' => '2', 'itemsCountPerPaginationPage' => '20' }</code>
  </dd>
</dl>

The **URLSearchParams** type definition is:

```typescript
interface URLSearchParams {
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  set(name: string, value: string): void;
  // ...
}
```

The **get** method returns only string or null. Is it O'K?

* Basically, all data coming from the client side is _a priori_ unreliable, so it is required to check is desired parameter 
  actually exists, and if not - respond with error (if this parameter is required).
* What if we want the numeric query parameter? Basically it's required to parse it, and if parsing failed - respond with error.
* What if we want the object-type or arrayed-type parameter? **URLSearchParams** does not support this.

The good frameworks must take case about these routines, and also TypeScript-first framework must solve these problems type-safely.
Before validate already transformed to object query parameters, we need to deal with the **serializing** - the transforming
of the string to native object.


## Serializing and deserializing of query parameters

As the part of URI, _initially_ query parameters are the simple string like `?paginationPage=2&itemsCountPerPaginationPage=20`.
This example with two numeric parameters is relatively simple but:

* How to express and parse the boolean type parameters?
* How to express and parse the object type parameters?
* How to express and parse the arrayed parameters?
* When try parse numeric parameters and when assume that it is a string?

There is de-facto no standard obligating to express and parse according to specific convention, thus working with
query parameters first what we need to negotiate about the **deserializing method**. 

> :warning: **Warning:**
> The native **URL** class uses own deserializing algorithm giving the `response.URI.searchParams`.
> To get different from `response.URI.searchParams` result, we need to deserialize `response.URI.search` according other
> algorithm and store the result to other property of `response`.

As default, the YDB using the [qs](https://www.npmjs.com/package/qs) library with default configuration.
If you want change the main deserializer for the whole application, define **URI_QueryParametersMainDeserializer**
in server configuration:

```typescript
Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  URI_QueryParametersMainDeserializer: (rawQueryParameters: string): ParsedJSON_Object => {
    // It will quite a lot of code, it's better to extract the implementation to separate file
  },
  routing: [
    // ...
  ]
});
```

You can also set the custom serializer for the specific route, but try to use single deserializing method for application.

```typescript
import { ArbitraryObject } from "@yamato-daiwa/es-extensions";

export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products",
    queryParametersDeserializer(rawQueryParameters: string): ParsedJSON_Object {
      // It will quite a lot of code, it's better to extract the implementation to separate file
    }
  })
  public async generateProductsPage(request: Request, response: Response): Promise<void> {
    // ...
  }
}
```

> :warning: **Warning:** 
> The query parameters serializer which being used on client side must be compatible with deserializer at server side.


## String, numeric and boolean query parameters

Once decide about query parameters serializing/deserializing, time to process them.
For this lesson, we will not change the default deserializer.

Let us create the handler returning JSON data this time, by other words - the element of REST API.
During this lesson, we will be always return the empty array because our target is dealing with query parameters and we
have not the data yet.

For the `generateProductsPage` transaction, let us support below query parameters:

* The pagination page number and items count per pagination page (numeric query parameters) 
* Searching by product name, or it's part (string query parameter)
* Must include the products out of stock (boolean query parameter)

Assume that pagination parameters are required while rest ones - no.

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
      fullOrPartialProductName: {
        type: String,
        required: false,
        minimalCharactersCount: 2
      },
      mustIncludeProductsOutOfStock: {
        preValidationModifications: BooleanParameterDefaultPreValidationModifier,
        type: Boolean,
        defaultValue: false
      }
    }
  })
  public async retrieveProductsSelection(request: Request, response: Response): Promise<void> {

    // Don't worry - we will refactor it
    const {
      paginationPageNumber,
      itemsCountPerPaginationPage,
      fullOrPartialProductName,
      mustIncludeProductsOutOfStock
    }: {
      paginationPageNumber: number;
      itemsCountPerPaginationPage: number;
      fullOrPartialProductName?: string;
      mustIncludeProductsOutOfStock: boolean;
    } = request.getProcessedQueryParameters();

    console.log(`paginationPageNumber: ${paginationPageNumber} (${typeof paginationPageNumber})`);
    console.log(`itemsCountPerPaginationPage: ${itemsCountPerPaginationPage} (${typeof itemsCountPerPaginationPage})`);
    console.log(`fullOrPartialProductName: ${fullOrPartialProductName} (${typeof fullOrPartialProductName})`);
    console.log(`mustIncludeProductsOutOfStock: ${mustIncludeProductsOutOfStock} (${typeof mustIncludeProductsOutOfStock})`);

    return response.submitWithSuccess({
      JSON_Content: []
    });
  }
}

```

The default serializer (**qs**) does not parse numbers and booleans (the reason has been explained by **qs** developers
in [this GitHub issue](https://github.com/ljharb/qs/issues/91)), so for the numeric and boolean parameters we still need
the `preValidationModifications`.

For the numeric parameters, use `convertPotentialStringToNumberIfPossible` pre-validation modification.
For the boolean parameters, you need to specify which value you want to consider as `true` and which - as `false`.
Again, there no standard for this. 
The most simple and clear convention is:

* Consider string "true" as boolean `true` value
* Consider string "false" as boolean `false` value
* Consider the missing query parameter as `false` value

This convention is simple, but type-safe implementation will be a little long:

```typescript
export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "api/products",
    queryParametersProcessing: {
      mustIncludeProductsOutOfStock: {
        preValidationModifications: (rawValue: unknown): unknown => {

          if (isUndefined(rawValue)) {
            return false;
          }


          if (isString(rawValue)) {

            if (rawValue === "true") {
              return true;
            }


            if (rawValue === "false") {
              return false;
            }
          }


          return rawValue;
        },
        type: Boolean,
        defaultValue: false
      },
      // ...
    }
  })
  public async retrieveProductsSelection(request: Request, response: Response): Promise<void> {
    // ...
  }
}
```

Taking care about routines, YDB framework provides the function which does these routines, but unfortunately in this case
it's impossible to create concise and clear function name such as the behaviour of this function is exhaustively understandable
from its name.

```typescript
export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "api/products",
    queryParametersProcessing: {
      // ...
      mustIncludeProductsOutOfStock: {
        preValidationModifications: BooleanParameterDefaultPreValidationModifier,
        type: Boolean,
        required: false
      }
    }
  })
  public async retrieveProductsSelection(request: Request, response: Response): Promise<void> { /* */ }
}
```


### Testing

Minimal case:

```
http://127.0.0.1:80/api/products?paginationPageNumber=1&itemsCountPerPaginationPage=20
```

The server will log:

```
paginationPageNumber: 1 (number)
itemsCountPerPaginationPage: 20 (number)
fullOrPartialProductName: undefined (undefined)
mustIncludeProductsOutOfStock: false (boolean)
```

The `mustIncludeProductsOutOfStock` is missing in URI, but according to our pre-validation modification, `false` value has
been substituted.


Try to omit the required query parameter:

```
http://127.0.0.1:80/api/products?paginationPageNumber=1
```

![](Images\ErrorLog-MissingRequiredQueryParameter.png)

Now, try to specify, for example, the negative pagination page number:

```
http://127.0.0.1:80/api/products?paginationPageNumber=-1&itemsCountPerPaginationPage=20
```

![](Images\ErrrorLog-InvalidNumberSet.png)


Next, try the searching by name:

```
http://127.0.0.1:80/api/products?paginationPageNumber=1&itemsCountPerPaginationPage=20&fullOrPartialProductName=hair
```

We'll get log:

```
paginationPageNumber: 1 (number)
itemsCountPerPaginationPage: 20 (number)
fullOrPartialProductName: hair (string)
mustIncludeProductsOutOfStock: false (boolean)
```


## Object-type query parameters

First, when the object-type query parameters could be useful?

Assume that admin users can view unpublish yet products, while regular users - not.
It means, for the regular uses the **forced filtering** will be applied.
Unlike this, the searching (filtering) by full or partial product name is **conscious filtering**.

We can represent the deserialized query parameters as:

```typescript
type DeserializedQueryParameters = {
  
  paginationPageNumber: number;
  itemsCountPerPaginationPage: number;
  
  forcedFiltering?: {
    unpublishedProducts?: boolean;
  };

  consciousFiltering?: {
    fullOrPartialProductName?: string;
  };
  
}
```

The same filters could be among forced and conscious filtering.
For example, in the admin users case **unpublishedProducts** could be among **consciousFiltering** too:

```typescript
type DeserializedQueryParameters = {
  
  paginationPageNumber: number;
  itemsCountPerPaginationPage: number;
  
  forcedFiltering?: {
    unpublishedProducts?: boolean;
  };

  consciousFiltering?: {
    unpublishedProducts?: boolean;
    fullOrPartialProductName?: string;
  };
  
}
```

> :warning: **Warning:**
> Just this organizing will not prevent the unauthorized access of regular users to unpublish products 
> (and other data intended to be forcedly filtered).
> Before respond with requested data, it is required to check has user enough authority to view the limited data and if no -
> respond with appropriate error.

Also, the query parameters including `forcedFiltering[unpublishedProducts]=false` could be visible in the search bar of user's
browser (if we are returning the whole HTML page) or developer tools (in the AJAX requests case) thus user will know about 
some products are being hidden. 
So in this case the creating of separate API for admin users is more safe solution.

> :warning: **Warning:**
> Well, there is no way to hide from the user which requests are being submitted - all we can do is check from whom
> the request has been submitted and respond the error if some problem with authority.

But the authority role dependent filtering is not only case where forced and conscious filtering concept could be used.
For example, in products page case there is no filtering by default while in maker profile page, only products of this
maker should be displayed. In this case, the forced filtering by makers will be.
 
Let us add the forced filtering my maker ID and move all previous filtering to **consciousFiltering**:

```typescript
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
          outOfStock: {
            preValidationModifications: BooleanParameterDefaultPreValidationModifier,
            type: Boolean,
            required: false
          }
        }
      }
    }
  })
  public async retrieveProductsSelection(request: Request, response: Response): Promise<void> {

    // Don't worry - will refactor it
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

    return response.submitWithSuccess({
      JSON_Content: []
    });
  }
}
```

Both **forcedFiltering** and **consciousFiltering** could be or could not be, so these properties are optional.
In this case, if **forcedFiltering** is defined, **makerID** must be defined too but if there are multiple filters,
each one could be optional.

Everything is ready to test. Let us try to submit the request with both forces and conscious filtering:

```
http://127.0.0.1:80/api/products?paginationPageNumber=1&itemsCountPerPaginationPage=20&forcedFiltering[makerID]=1&consciousFiltering[fullOrPartialProductName]=hair
```

Among console logs, we can see correctly parsed object-type query parameters:

```
{ makerID: 1 }
{ fullOrPartialProductName: 'hair', outOfStock: false }
```


## Array-type query parameters

Let us add the filtering by categories to above API.
Assume that each category has numeric ID as the product, for the filtering, the IDs of desired categories must be specified.
The **qs** library understands below arrayed parameters notations as default:

>
> ```javascript
> const withArray = qs.parse('a[]=b&a[]=c');
> assert.deepEqual(withArray, { a: ['b', 'c'] });
>
> const withIndexes = qs.parse('a[1]=c&a[0]=b');
> assert.deepEqual(withIndexes, { a: ['b', 'c'] });
> ```
> https://www.npmjs.com/package/qs


Let us modify the query parameters processing of above example:

```typescript
export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "api/products",
    queryParametersProcessing: {
      // ...
      consciousFiltering: {
        type: Object,
        required: false,
        properties: {
          // ...
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
  public async retrieveProductsSelection(request: Request, response: Response): Promise<void> { /* ... */ }
}
```

Next, try to search the products by 2 categories.
According default conventions of **qs** library, the valid URI will be like:

```
http://127.0.0.1:80/api/products?consciousFiltering[categoriesIDs][0]=1&consciousFiltering[categoriesIDs][1]=2&paginationPageNumber=1&itemsCountPerPaginationPage=20
```

There are no forced filtering now, but there will be the **consciousFiltering** will be the object with arrayed property this time:

```
{ outOfStock: false, categoriesIDs: [ 1, 2 ] }
```


## Organizing of code

Significantly, but we need to know

* HTTP method
* URI
* Path parameters
* Query parameters

of each request **on both client and server sides**.
In those days when the programming languages for the server and client sides was different, it was inevitably to 
declare and edit this metadata on client and server sides separately because BrowserJS could not read files like 
server language (maybe it was some workarounds like bundling of non JavaScript files by early frontend project building
systems of parsing of JavaScript file of server language, but this acrobatics hardly has been frequently used).

But ever today, when both client and server could be written by TypeScript (and then transpiled to Browser JavaScript and
Node.js respectively), the practice to define the metadata mentioned above on client and server side separately is still
popular. Well, we will not discuss the disadvantages of this methodology here; we just prepare the file intended to be
used by both client and server sides. Create the file with **ProductTransactions.ts** name with below content:

```typescript
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


namespace ProductTransactions {

  export namespace SelectionRetrieving {

    export const HTTP_METHOD: HTTP_Methods = HTTP_Methods.get;

    export const URI_PATH: string = "api/products";

    export type QueryParameters = {
      paginationPageNumber: number;
      itemsCountPerPaginationPage: number;
      forcedFiltering?: {
        makerID: number;
      };
      consciousFiltering?: {
        fullOrPartialProductName?: string;
        outOfStock?: boolean;
        categoriesIDs?: Array<number>;
      }
    };
  }
}


export default ProductTransactions;
```

Then, use the data from this file in Product controller. The final code of lesson will be:

```typescript
import ProductTransactions from "./ProductTransactions";
import { Request, Response, Controller, BooleanParameterDefaultPreValidationModifier } from "@yamato-daiwa/backend";
import { RawObjectDataProcessor, convertPotentialStringToNumberIfPossible } from "@yamato-daiwa/es-extensions";


export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: ProductTransactions.SelectionRetrieving.HTTP_METHOD,
    pathTemplate: ProductTransactions.SelectionRetrieving.URI_PATH,
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
          outOfStock: {
            preValidationModifications: BooleanParameterDefaultPreValidationModifier,
            type: Boolean,
            required: false
          },
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
    }: ProductTransactions.SelectionRetrieving.QueryParameters = request.getProcessedQueryParameters();

    console.log(request.URI);
    console.log(paginationPageNumber);
    console.log(itemsCountPerPaginationPage);
    console.log(forcedFiltering);
    console.log(consciousFiltering);

    return response.submitWithSuccess({
      JSON_Content: []
    });
  }
}
```

You can notice "The definition of 'HTTP_Method' and 'pathTemplate' became to long, it was much clear before refactoring".
Saying this, you are focused on quickly write the code while must focus on the application maintainability after realize. 
All definitions below **ProductTransactions.SelectionRetrieving** will be reused on client side, so

* No subsequent code editing will require if to change the value of **ProductTransactions.SelectionRetrieving.URI_PATH** neither
  on client nor on server side.
* If we will change **ProductTransactions.SelectionRetrieving.QueryParameters**, the TypeScript transpiling on both client and
  server emits errors. Is it bad? No! Because we know where we must to edit the code to restore both client and server side.
