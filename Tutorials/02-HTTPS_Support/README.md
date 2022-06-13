# HTTPS support

Developing the secure web-site/web application, the HTTPS protocol is being considered instead of HTTP or with HTTP.
You can learn more about HTTP vulnerabilities, for example, in 
[this article](https://www.cloudflare.com/learning/ssl/why-is-http-not-secure/).

To enable the HTTPS on your website/web application, you need to get the [SSL certificate](https://en.wikipedia.org/wiki/Public_key_certificate).
It could be paid or free - the selecting depending on security requirements of your website/web application 
(the highest requirements are for the services accepting the payments).


## Obtaining of the SLL key and certificate for the local development mode

For the local development mode, you can use the [OpenSSL](https://www.openssl.org/) utility 
(if your OS is Windows, use [Git Bash](https://gitforwindows.org/) which has build-in **OpenSSL**) to obtain the SSL key
and certificate.

When the preparations will complete, execute below command and answer to all questions.
You can customize the key file name (`-keyout` parameter) and certificate file name (`-out` parameter).

```
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

If you are working in a team, you can share these files via Version Control System - but for the local development
mode only.


## Code

You can use the project create at previous lesson or create new one.
As soon as it's ready, open the entry point file.

We will keep the HTTP protocol support just to make sure that framework cold serve both protocols, but you might not
need the HTTP protocol support in real application.

Add **HTTPS** property to server configuration. It includes three child property:

* **port**: similar to HTTP case, it is the port for HTTPS protocol. The default port to HTTPS is **443**, but this
  value stored in **ProtocolDependentDefaultPorts** enumeration.
* **SSL_CertificateFileRelativeOrAbsolutePath** - the path to SSL certificate which must be prepared earlier.
  If you pass the relative path, the absolute one will be computed from `process.cwd()`. 
* **SSL_KeyFileRelativeOrAbsolutePath** - the  path to SSL key which must be prepared earlier.
  If you pass the relative path, the absolute one will be computed from `process.cwd()`.

```typescript
import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";
import Path from "path";


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  HTTPS: {
    
    port: ProtocolDependentDefaultPorts.HTTPS,

    SSL_CertificateFileRelativeOrAbsolutePath: "SSL/cert.pem",
    SSL_KeyFileRelativeOrAbsolutePath: "SSL/key.pem",
    
    // or: 
    // SSL_CertificateFileRelativeOrAbsolutePath: Path.resolve(__dirname, "SSL", "cert.pem"),
    // SSL_KeyFileRelativeOrAbsolutePath: Path.resolve(__dirname, "SSL", "key.pem"),
    
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

In real application, the values of **SSL_CertificateFileRelativeOrAbsolutePath** and **SSL_KeyFileRelativeOrAbsolutePath** 
will be environment-dependent. We will discuss the environment dependent configuration in 
[Dotenv config](../05-DotenvConfig/README.md) and [Console line interface](../06-ConsoleLineInterface/README.md) lessons.

The starting of server procedure is similar to previous lesson, but this time you will see two success messages
instead of one - for HTTP and HTTPS functionality respectively:

![Example](Images/ServerSuccessfullyStartedLog.png)

The testing of HTTP functionality is same as in previous lesson, but here we are interested in HTTPS functionality.

If you try to submit `https://127.0.0.1:443` from the browser, you will be warned about non-secure connection.
Similar warning will be made by Postman:

![Example](Images/PostmanNonSecureConnectionWarning.png)

The self-signed SSL certificate provides same security as issued certificates, but the browser and HTTP clients does not
trust them (it is understandable - is anyone can create the SLL certificate, the scammers can too). But because we need
this certificate the local development mode, we need add our certificate to list of trusted ones. It is possible

* For the Linux: via browser
* For the Mac OS X: via [Keychain Access](https://support.apple.com/en-gb/guide/keychain-access/kyca1083/mac) 

`https://localhost` will work similarly to `https://127.0.0.1:443` and `https://127.0.0.1` as long as we use the default
HTTPS port.
