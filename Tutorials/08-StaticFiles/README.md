# Responding with static files

In the previous lessons we were focused on analyzing of the incoming data - **route path parameters**,
**route query parameters**, **configuration**.
Time to respond with some payload to client side.

We will begin with submitting of the static files. 
It could be any kind of files, but usually it is:

- HTML files including the HTML markup, usually has **.html** file name extension.
- Stylesheets including styles, usually has **.css** file name extension.
- Scripts with **.js** extension (for the browser runtime, of course).
- Images
- Videos
- Fonts
- Audios

Let us prepare two files.
First one is **index.html** with below content:

```html
<!doctype html>
<html lang="en">

  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Top page</title>
  </head>

  <body>
    <h1>Top page</h1>
  </body>

</html>
```

As it was told in the first lesson, the **YDB** frameworks provides the default [favicon](https://en.wikipedia.org/wiki/Favicon)
when browser requests it. Let us prepare custom one, for example, by [favicon.io](https://favicon.io).
The icon could be generated from you image file, text or emoji - on your choice.
It will be the second file.

Put these files in the root directory of the project _temporary_.
We will start with minimal entry point now:

```typescript
import { Server, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";

Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP }
});
```

If we start the server and request **http://127.0.0.1/index.html**, we will get "Not found" error.
If the **index.html** file has been returned by our application, anyone could get any file by this way
including sensitive data like Dotenv configuration! 
From here, we have the first **Safety engineering rule at responding with files**.

> :warning: **Safety engineering rule #1**
> 
> All files indented to be available for all user <ins>regardless to authentication and authorization</ins>
> must be stored in special so-called "public" directory.

Usually, this folder is being named **public**, but **YDB** framework does not restrict this.
So, let us create the directory with name **public** and move **index.html** and **favicon.ico** there.
To make these files from this directory visible for anyone, we need to specify
**publicDirectoriesAbsoluteOrRelativePaths** property of the server configuration.
This property has arrayed type, thus you can specify multiple directory, but try to keep all non-restricted files
in the single directory because to resolve the absolute path the file it is required to check all possible absolute paths
which could cause the performance impact.

```typescript
Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  publicDirectoriesAbsoluteOrRelativePaths: [ "public" ]
});
```

Now, the **http://127.0.0.1/index.html** will return the **public.html** file.
If correct **favicon** will not display at your browser, it could be because of browser caching - 
try to [hard refresh](https://www.documate.org/resources/what-is-a-hard-refresh-how-to-do-a-hard-refresh-in-any-browser) the page.

Noticeable, but the web-servers like [Apache](https://httpd.apache.org) has the default behaviour including
the pre-defined rules related with restricting of the files. Unlike this the YDB and Node.js at whole
doing only what has been ordered. Someone considering it as disadvantage, someone as advantage.
What about us is we are the advantage ones because we are demand from ourselves and our subordinates fully
understand what we are doing. Concerning the YDB framework, is has not public directories by default -
the framework user can only consciously create and activate this directory.

> :warning: **Safety engineering rule #2**
>
> Public and restricted files must _not_ be mixed in public directory

By other words, never mix the public and restricted files at single directory.
Even if it's possible to make the restricted file invisible from the public folder - don't put it to public folder!
Such exclusions make the access managing complicated thus it is become easy to miss something and as result the secret 
data leaking will occur!


> :warning: **Safety engineering rule #3**
>
> Never put to public directory the files which available in dependence on the authentication and/or authority,
> for example, for authenticated users only or for admin users only.

This rule is obvious consequence of the **rule #1**, but there is the reason to declare it explicitly.

For example, if we are developing the payment service, the local law could oblige us to collect the scans of 
passports of our users. 
Normal users must not have access to uploaded scans, while administration users - must have.
If we'll store these scans to public folder, the malicious user could guess the path to passport scan file and the
sensitive personal data will leak and most likely will be used for the bad purposes like making a loan on the passport holder!

Well, in real services, the safe organizing of such critical confidential data is more complicated than just splitting of
directories to public and restricted, but you have understood the background of the **rule #3**.

O'K, but how to respond with the file dependently on authentication and/or authority?
The short answer is via normal routing.


## Conditional responding with files

Let us respond with file on **http://127.0.0.1/restricted_file** only if query parameter **secret** has been specified
width correct value (for example, "ALPHA").
In the real application, it will be the authentication and authorization check, but it is the too huge topics to integrate
it to current lesson.

```typescript
import { ProtocolDependentDefaultPorts, Server } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  publicDirectoriesAbsoluteOrRelativePaths: [ "public" ],
  routing: [
    {
      route: {
        HTTP_Method: HTTP_Methods.get,
        pathTemplate: "restricted_file",
        queryParametersProcessing: {
          secret: {
            type: String,
            required: false
          }
        },
      },
      handler(request: Request, response: Response): Promise<void> {
        
        // TODO Check the query parameter "secret"
        
        // TODO Submit the file if query parameter "secret" is correct 
      }
    }
  ]
});
```

This time, we will not use the `queryParametersProcessing` because if we use it the validation error messages will be 
responded to user and this way user will know about secret query parameter.

```typescript
const secret: string | null = request.URI.searchParams.get("secret");
```

When the value of query parameter "secret"  is not "ALPHA", we can respond with "unauthorized (401)" error code,
but this way the malicious user will know that this file is exists thus he is in a right way.
So, it's better to response with "not found (404)" status.

```typescript
import { ProtocolDependentDefaultPorts, Request, Response, Server } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";
import { ClientErrorsHTTP_StatusCodes } from "@yamato-daiwa/backend/Distributable/UtilsIncubator/HTTP_StatusCodes"; // TODO 移動


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  publicDirectoriesAbsoluteOrRelativePaths: [ "public" ],
  routing: [
    {
      route: {
        HTTP_Method: HTTP_Methods.get,
        pathTemplate: "restricted_file"
      },
      handler(request: Request, response: Response): Promise<void> {

        const secret: string | null = request.URI.searchParams.get("secret");

        if (secret !== "ALPHA") {
          return response.submitWithError({ statusCode: ClientErrorsHTTP_StatusCodes.notFound })
        }


        // TODO Submit the file if query parameter "secret" is correct
      }
    }
  ]
});
```

Let us prepare the secret file - it could be any file on your choice.
Now how to submit this file with good performance?

In most Node.js lessons for novices "Don't use **fs.readFileSync** once server started because it makes the performance
impact" is being told. However, in almost lessons is not being told that the **fs.readFile** (asynchronous version) is 
not the best choice too. Why? 

**fs.readFile** fully reads the file before call the callback, then file content will be stored in RAM until the client
receive it. With such approach and combination of below conditions, available RAM will be quickly exhausted.

* **Slow internet connection** (yes, despite the fact that we are allowing ourselves to critically depend on internet, 
  it is not available everywhere as air and also the slow internet still applies dependent on location especially for 
  users of mobile devices)
* **Big files** such as images and videos
* **Multiple clients** which is normal for any public website or web applications.

The usage of [Steam API](https://nodejs.org/api/stream.html) is a native solution, but good framework must encapsulate
such technical details and do the high-level orders like "submit file" or "submit the HTML code". Of course, the YDD
do this, and all you need is call the method `response.submitWithSuccess` pass the path to desired file:

```typescript
Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  publicDirectoriesAbsoluteOrRelativePaths: [ "public" ],
  routing: [
    {
      route: {
        HTTP_Method: HTTP_Methods.get,
        pathTemplate: "restricted_file"
      },
      handler(request: Request, response: Response): Promise<void> {

        const secret: string | null = request.URI.searchParams.get("secret");

        if (secret !== "ALPHA") {
          return response.submitWithError({ statusCode: ClientErrorsHTTP_StatusCodes.notFound })
        }


        return response.submitWithSuccess({ filePath: Path.join(__dirname, "SecretFile.png") })
      }
    }
  ]
});
```
