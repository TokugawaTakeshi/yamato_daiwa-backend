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
* What if we want the numeric query parameter? Basically it's required to parse it, and is parsing failed - respond with error.
* What if we want the object-type or arrayed-type parameter? **URLSearchParams** does not support this.

The good frameworks must take case about these routines, and also TypeScript-first framework must solve these problems type-safely.
Before validate already transformed to object query parameters, we need to deal with serializing - the transforming
of the string to native object.


## Query parameters serializing and deserializing

As the part of URI, _initially_ query parameter is simple string like `?paginationPage=2&itemsCountPerPaginationPage=20`.
This example with two numeric parameters is relatively simple but:

* How to express and parse the boolean type parameters?
* How to express and parse the object type parameters?
* How to express the parse arrayed parameters?
* When try parse numeric parameters and when assume that it is a string?

There is de-facto no standard obligating to express and parse according to specific convention, thus working with
query parameter first what we need to negotiate is the **deserializing method**. 

> :warning: **Warning:**
> The native **URL** class uses own deserializing algorithm giving `response.URI.searchParams`.
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

You can also set the custom serializer for the specific route, but try to use single deserializing method for application:

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

For the `generateProductsPage` transaction, let us support below query parameters:

* The pagination page number and items count per pagination page (numeric query parameters) 
* Searching by product name, or it's part (string query parameter)
* Must include the products out of stock (boolean query parameter)

Assume that pagination parameters are required while rest ones - no.


```typescript
export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products",
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
      searchingByFullOrPartialProductName: {
        type: String,
        required: false,
        minimalCharactersCount: 2
      },
      mustIncludeProductsOutOfStock: {
        preValidationModifications: (rawValue: unknown): boolean => (isString(rawValue) && rawValue !== "false"),
        type: Boolean,
        defaultValue: false
      }
    }
  })
  public async generateProductsPage(request: Request, response: Response): Promise<void> {

    // Don't worry - will refactor it
    const {
      paginationPageNumber,
      itemsCountPerPaginationPage,
      searchingByFullOrPartialProductName,
      mustIncludeProductsOutOfStock
    }: {
      paginationPageNumber: number,
      itemsCountPerPaginationPage: number,
      searchingByFullOrPartialProductName?: string,
      mustIncludeProductsOutOfStock?: boolean;
    } = request.getProcessedQueryParameters();

    console.log(`paginationPageNumber: ${paginationPageNumber} (${typeof paginationPageNumber})`);
    console.log(`itemsCountPerPaginationPage: ${itemsCountPerPaginationPage} (${typeof itemsCountPerPaginationPage})`);
    console.log(
      `searchingByFullOrPartialProductName: ` +
      `${searchingByFullOrPartialProductName} (${typeof searchingByFullOrPartialProductName})`
    );
    console.log(`mustIncludeProductsOutOfStock: ${mustIncludeProductsOutOfStock} (${typeof mustIncludeProductsOutOfStock})`);

    return response.submitWithSuccess({
      HTML_Content: "<h1>Products list</h1>"
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
    pathTemplate: "products",
    queryParametersProcessing: {
      // ...
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
        required: false
      }
    }
  })
  public async generateProductsPage(request: Request, response: Response): Promise<void> { /* */ }
}
```

Taking care about routines, YDB framework provides the function which does these routines, but unfortunately in this case
it's impossible to create concise and clear function name such as the behaviour of this function is exhaustively understandable
from its name.

```typescript
export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products",
    queryParametersProcessing: {
      // ...
      mustIncludeProductsOutOfStock: {
        preValidationModifications: BooleanParameterDefaultPreValidationModifier,
        type: Boolean,
        required: false
      }
    }
  })
  public async generateProductsPage(request: Request, response: Response): Promise<void> { /* */ }
}
```


### Testing

Minimal case:

```
http://127.0.0.1:80/products?paginationPageNumber=1&itemsCountPerPaginationPage=20
```

The server will log:

```
paginationPageNumber: 1 (number)
itemsCountPerPaginationPage: 20 (number)
searchingByFullOrPartialProductName: undefined (undefined)
mustIncludeProductsOutOfStock: false (boolean)
```

The `mustIncludeProductsOutOfStock` is missing in URI, but according to our pre-validation modification, `false` value has
been substituted.


Try to omit the required query parameter:

```
http://127.0.0.1:80/products?paginationPageNumber=1
```

![](Images\ErrorLog-MissingRequiredQueryParameter.png)

Now, try to specify, for example, negative pagination page number:

```
http://127.0.0.1:80/products?paginationPageNumber=-1&itemsCountPerPaginationPage=20
```

![](Images\ErrrorLog-InvalidNumberSet.png)


Next, try the searching by name:

```
http://127.0.0.1:80/products?paginationPageNumber=1&itemsCountPerPaginationPage=20&searchingByFullOrPartialProductName=hair
```

We'll get log:

```
paginationPageNumber: 1 (number)
itemsCountPerPaginationPage: 20 (number)
searchingByFullOrPartialProductName: hair (string)
mustIncludeProductsOutOfStock: false (boolean)
```


## Object-type query parameters

First, when object-type query parameters could be useful?

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
browser thus user will know about some products abe being hidden. So in this case the creating of separate API for admin
users is more safe solution.

But the authority role dependent filtering is not only case where forced and conscious filtering conception could be used.
For example, in products page case there is no filtering by default while in maker profile page, only products of this
maker should be displayed. In this case, the forced filtering by makers will be.

Let's prepare the handler returned the JSON, not HTML this time.
Assume that this API could be used on both products list and maker profile page.
We will not prepare the data for now because the current target is processing of the query parameters. 

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
      paginationPageNumber: number,
      itemsCountPerPaginationPage: number,
      forcedFiltering?: { makerID: number; }
      consciousFiltering?: { fullOrPartialProductName: number; }
    } = request.getProcessedQueryParameters();

    console.log(request.URI);
    console.log(paginationPageNumber);
    console.log(itemsCountPerPaginationPage);
    console.log(forcedFiltering);
    console.log(consciousFiltering);

    return response.submitWithSuccess({ JSON_Content: [] });
  }
}
```

Both **forcedFiltering** and **consciousFiltering** could be or could not be, so these properties are optional.
In this case, if **forcedFiltering** is defined, **makerID** must be defined too 
(same for **fullOrPartialProductName** and **fullOrPartialProductName**), but if there are multiple filters,
each one could be optional too.

> :warning: **Warning:**
> In the case of such REST API, the query parameters will be displayed in the user's browser search bar.
> However, the user still can know about forced filtering from the **developer tools** which are available is the most 
> popular browsers and try to submit the request without forced filtering.
> Well, there is no way to hide from the user which requests are being submitted - all we can do is check from whom
> the request has been submitted and respond the error if some problem with authority. 

Everything is ready to test. Let us try to submit the request with both forces and conscious filtering:

```
http://127.0.0.1:80/api/products?paginationPageNumber=1&itemsCountPerPaginationPage=20&forcedFiltering[makerID]=1&consciousFiltering[fullOrPartialProductName]=hair
```

Among console logs, we can see correctly parsed object-type query parameters:

```
{ makerID: 1 }
{ fullOrPartialProductName: 'hair' }
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

  // ...

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
    // ...
  }
}
```

Next, try to search the products by 2 categories.
According default conventions of **qs** library, the correct URI will be like:

```
http://127.0.0.1:80/api/products?paginationPageNumber=1&itemsCountPerPaginationPage=20&consciousFiltering[categoriesIDs][0]=1&consciousFiltering[categoriesIDs][1]=2
```

There are no forced filtering now, but there will be the **consciousFiltering** will be the object with arrayed property this time:

```
{ categoriesIDs: [ 1, 2 ] }
```


[//]: # (## Organizing of code)

[//]: # ()
[//]: # ()
[//]: # (Significantly, we need to know)

[//]: # ()
[//]: # ()
[//]: # (* HTTP method)

[//]: # ()
[//]: # (* URI)

[//]: # ()
[//]: # (* Path parameters)

[//]: # ()
[//]: # (* Query parameters)

[//]: # ()
[//]: # ()
[//]: # (of each request on both client and server side. )

[//]: # ()
[//]: # ()
[//]: # (// ...)

[//]: # ()
[//]: # ()
[//]: # (Let's create the file **ProductInteractions**)

[//]: # ()
[//]: # ()
[//]: # (```typescript)

[//]: # ()
[//]: # (namespace CategoryInteractions {)

[//]: # ()
[//]: # ()
[//]: # (  export namespace RetrievingByID {)

[//]: # ()
[//]: # ()
[//]: # (    export const HTTP_METHOD: HTTP_Methods = HTTP_Methods.get;)

[//]: # ()
[//]: # ()
[//]: # (    export namespace URI_Path {)

[//]: # ()
[//]: # ()
[//]: # (      export type Parameters = {)

[//]: # ()
[//]: # (        readonly categoryID: string;)

[//]: # ()
[//]: # (      };)

[//]: # ()
[//]: # ()
[//]: # (      export namespace Parameters {)

[//]: # ()
[//]: # (        export enum Names {)

[//]: # ()
[//]: # (          categoryID = "categoryID")

[//]: # ()
[//]: # (        })

[//]: # ()
[//]: # (      })

[//]: # ()
[//]: # ()
[//]: # (      export function build&#40;{ targetCategoryID }: { targetCategoryID: Category.ID; }&#41;: string {)

[//]: # ()
[//]: # (        return `/api/categories/${targetCategoryID}`;)

[//]: # ()
[//]: # (      })

[//]: # ()
[//]: # ()
[//]: # (      export const TEMPLATE: string = build&#40;{ targetCategoryID: `:${Parameters.Names.categoryID}` }&#41;;)

[//]: # ()
[//]: # (    })

[//]: # ()
[//]: # (  })

[//]: # ()
[//]: # (})

[//]: # ()
[//]: # (```)
