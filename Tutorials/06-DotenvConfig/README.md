# Dotenv config

## Minimal theory

The settings like IP address, port, database connection credentials etc. are being frequently retrieved from the 
configuration files - it could be JSON, XML, YAML but noticeable one is [.env](https://smartmob-rfc.readthedocs.io/en/latest/2-dotenv.html).

The format is pretty simple: `KEY=VALUE`, for example:

```dotenv
REDIS_URL=redis+tcp://localhost:6379/0
MYSQL_URL=mysql+tcp://root:thepassword@localhost:3306/MySchema
```

### Importing of .env

First of all, the Node.js has not native functionality for the working with **.env** files - only third-party solutions.

Next, the parsed variables are frequently not just being imported - they are also being merged with 
[**process.env**](https://nodejs.org/dist/latest-v8.x/docs/api/process.html#process_process_env) object.
Although this practice is being occurred, it is not recommended to merge the data from **.env** file with **process.env**:

> Littering it through out a project could lead to maintenance issues as it's another kind of global dependency. 
As such, it could lead to merge conflicts in a multi-user setup and deployment issues in a multi-server setup. 
Instead, one of the best practices is to define all those parameters in a single configuration/settings file which could
be accessed throughout the project.
>
> [The documentation to **eslint-plugin-node**](https://github.com/mysticatea/eslint-plugin-node/blob/master/docs/rules/no-process-env.md)

On this account, YDB does not suggest the functionality of merging of variables from **.env** file with **process.env**.
If you are critically need this functionality, use the third-party solutions like [dotenv](https://www.npmjs.com/package/dotenv).


### Managing of the sensitive data

**.env** files could contain some sensitive data like credentials for the database.
To reduce the probability of data leaking, the Version Controls Systems like **Git** are being frequently set
to ignore the files like **.env**, herewith the in the teamwork case the back-end or project leader must give the
**.env** file directory to each engineer of the team. "Directory" usually means "via Slack" or "via email", but it is
risky too - the recommended method is [dotenv-vault](https://github.com/dotenv-org/dotenv-vault) (by the way, it could
be integrated with Slack and [other tools](https://github.com/dotenv-org/dotenv-vault#works-with)). 

Also, the sample of **.env** file is frequently being provided in the root of the project (usually **.env.example**). 
It has dummy values the leaking of which is not dangerous thus no need to ignore it by versions control system.

It is also possible to split the sensitive and non-sensitive data to multiple files and ignore by 
Version Controls System just first one.

Finally, the **.env** files are usually different for the local development mode, testing , staging and production modes.
The usual files naming is **.env.local**, **env.production** etc.


### Why not store the type-safe config in TypeScript files?

Well, it is the option. 
Some frameworks like [Nuxt.js](https://nuxtjs.org) supports the configuration files written by TypeScript 
(with [appropriate plugins](https://typescript.nuxtjs.org)). 

What is not good is if we change the configuration, we need to rebuild the project.
It is not the problem for the small project, but as far as the project become larger, the rebuilding will take
more and more time and efforts (the Continuous Integration could automate some routines, but it still will take some time -
it could be critical when application is already has been realized).

The usage of [ts-node](https://www.npmjs.com/package/ts-node) solves the problems with rebuilding,
but the **ts-node** is not de facto standard tool, so we should support the scenario when transpiled JavaScript
is being executed by Node.js.


## Practice

### Basic importing, validation and processing

As it was mentioned above, there is no native Node.js functionality for the working with **.env** files.
From our side, we are suggesting the **ObjectDataFilesProcessor** with the library 
[@yamato-daiwa/es-extensions-nodejs](https://www.npmjs.com/package/@yamato-daiwa/es-extensions-nodejs)
(it is using [dotenv](https://www.npmjs.com/package/dotenv) as dependency, but only for parsing of variables, not for
reading of the files).

It works with YAML, JSON and dotenv, so since we will not merge the variables from the file with **process.env**, 
the config could be defined by any of these formats.
**ObjectDataFilesProcessor** also validates imported data using [RawObjectDataProcessor](https://github.com/TokugawaTakeshi/Yamato-Daiwa-ES-Extensions/blob/master/CoreLibrary/Package/Documentation/RawObjectDataProcessor/RawObjectDataProcessor.md).
If you followed the advice to learn the lessons sequentially, you are already familiar with defining of the valid data
specification for the **RawObjectDataProcessor**.

Well, we could start with minimal entry point:

```typescript
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
    }
  ]
});
```

Let us define the **IP_Address** and **HTTP.port** in the **.env** file:

```dotenv
IP_ADDRESS=127.0.0.1
HTTP_PORT=80
```

Next, modify the EntryPoint with below code.

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
    nameForLogging: "ConfigFromDotenvFile", // ✏　1
    subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
    properties: {
      IP_ADDRESS: {
        type: String,
        required: true
      },
      HTTP_PORT: {
        preValidationModifications: convertPotentialStringToNumberIfPossible, // ✏　2
        type: Number,
        numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger,
        required: true
      }
    }
  }
});


/* Running the test:
*  npx nodemon EntryPoint.ts
* */
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

> :warning: **Warning:** The **nodemon** will not restart the application on changing of .env file because
> it does not watch for the changes of this file type (all most likely don't know about we have import this file by
> direct reading). 

#### Explanations
##### ✏　1

If there will be the problems with validation, the specified name will be used for the accurate logging.


##### ✏　2

Similarly to [qs](https://www.npmjs.com/package/qs) does not try to parse the seems to be numeric query parameters,
[dotenv parser](https://www.npmjs.com/package/dotenv) on which **@yamato-daiwa/backend** depending does not try
to parse seems to be numeric variables. The solution is same as in query parameters case -
use **convertPotentialStringToNumberIfPossible** helper.


### Defining of the defaults

Currently, both **IP_ADDRESS** and **HTTP_PORT** are required. What if we want to define the defaults?

First method is make these properties to optional and substitute the defaults:

```typescript
import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods, RawObjectDataProcessor, convertPotentialStringToNumberIfPossible } from "@yamato-daiwa/es-extensions";
import { ObjectDataFilesProcessor } from "@yamato-daiwa/es-extensions-nodejs";


const configFromDotEnvFile: Readonly<{
  IP_ADDRESS?: string;
  HTTP_PORT?: number;
}> = ObjectDataFilesProcessor.processFile({
  filePath: ".env",
  schema: ObjectDataFilesProcessor.SupportedSchemas.DOTENV,
  validDataSpecification: {
    nameForLogging: "ConfigFromDotEnvFile",
    subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
    properties: {
      IP_ADDRESS: {
        type: String,
        required: false
      },
      HTTP_PORT: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
        type: Number,
        numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger,
        required: false
      }
    }
  }
});


Server.initializeAndStart({
  IP_Address: configFromDotEnvFile.IP_ADDRESS ?? "127.0.0.1",
  HTTP: { port: configFromDotEnvFile.HTTP_PORT ?? ProtocolDependentDefaultPorts.HTTP },
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

But the defining of defaults inside `Server.initializeAndStart({  })` is not good from the viewpoint
of organizing of the code. Other approach is define the default values in **validDataSpecification**:

```typescript
const configFromDotEnvFile: Readonly<{
  IP_ADDRESS: string;
  HTTP_PORT: number;
}> = ObjectDataFilesProcessor.processFile({
  filePath: ".env",
  schema: ObjectDataFilesProcessor.SupportedSchemas.DOTENV,
  validDataSpecification: {
    nameForLogging: "ConfigFromDotEnvFile",
    subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
    properties: {
      IP_ADDRESS: {
        type: String,
        defaultValue: "127.0.0.1"
      },
      HTTP_PORT: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
        type: Number,
        numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger,
        defaultValue: ProtocolDependentDefaultPorts.HTTP
      }
    }
  }
});
```

In this case, at the preprocessed data **configurationFromDotEnv** type all properties will be required because
if they have not been defined ad **.env**, the default values will be substituted during data processing.

Well, but this method is acceptable for the initial draft code only.
Let us advance towards the real application.


### Accessing to the configuration from everywhere in application

Now we can use **configurationFromDotEnv** inside `Server.initializeAndStart({  })`. But what if we want to use
this configuration in other TypeScript files? Although we unlikely will need to know **IP_ADDRESS** and **PORT** in 
other files, it could be tens of other variables.

First, let us extract the type of  **configurationFromDotEnv** to separate file:

```typescript
type ConfigFromDotEnvFile = Readonly<{
  IP_ADDRESS?: string;
  HTTP_PORT?: number;
}>;


export default ConfigFromDotEnvFile;
```

We made **IP_ADDRESS** and **HTTP_PORT** optional again - it is much clear because one who fill the **.env** file
actually could omit these values since they are optional.


Next create one more type:

```typescript
type Config = Readonly<{
  IP_Address: string;
  HTTP_Port: number;
}>;


export default Config;
```

Besides the properties naming (**screaming snake case** is de facto standard for the **Dotenv** files), all properties 
required - even some variable in **Dotenv** omitted, the default one has been substituted.


One of solutions for the sharing of this configuration is **Config representative** pattern - it is the class
which stores the config inside self and also could make some computing's.

```typescript
import Config from "./Config";
import type ConfigFromDotEnvFile from "./ConfigFromDotEnvFile";

import { ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { Logger, ClassRequiredInitializationHasNotBeenExecutedError, isNull } from "@yamato-daiwa/es-extensions";


export default class ConfigRepresentative {

  private static config: Config | null = null;


  public static initialize(
    configFromDotEnvFile: ConfigFromDotEnvFile
  ): void {
    ConfigRepresentative.config = {
      IP_Address: configFromDotEnvFile.IP_ADDRESS ?? "127.0.0.1",
      HTTP_Port: configFromDotEnvFile.HTTP_PORT ?? ProtocolDependentDefaultPorts.HTTP
    }
  }


  public static get IP_Address(): string {
    return ConfigRepresentative.getConfigWhichExpectedToBeInitialized().IP_Address;
  }

  public static get HTTP_Port(): number {
    return ConfigRepresentative.getConfigWhichExpectedToBeInitialized().HTTP_Port;
  }


  private static getConfigWhichExpectedToBeInitialized(): Config {

    if (isNull(ConfigRepresentative.config)) {
      Logger.throwErrorAndLog({
        errorInstance: new ClassRequiredInitializationHasNotBeenExecutedError({
          className: "ConfigRepresentative",
          initializingMethodName: "initialize"
        }),
        title: ClassRequiredInitializationHasNotBeenExecutedError.localization.defaultTitle,
        occurrenceLocation: "ConfigRepresentative.getConfigWhichExpectedToBeInitialized()"
      });
    }


    return ConfigRepresentative.config;
  }
}
```

If you are think that this class if verbose, it is because currently our application is too small -
just two configurable variables. Let us modify the entry point using **ConfigRepresentative**:


```typescript
/* --- Configuration ------------------------------------------------------------------------------------------------ */
import type ConfigFromDotEnvFile from "./ConfigFromDotEnvFile";
import ConfigRepresentative from "./ConfigRepresentative";

/* --- Framework ---------------------------------------------------------------------------------------------------- */
import { Server, Request, Response } from "@yamato-daiwa/backend";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import { HTTP_Methods, RawObjectDataProcessor, convertPotentialStringToNumberIfPossible } from "@yamato-daiwa/es-extensions";
import { ObjectDataFilesProcessor } from "@yamato-daiwa/es-extensions-nodejs";


const configFromDotEnvFile: ConfigFromDotEnvFile = ObjectDataFilesProcessor.processFile({
  filePath: ".env",
  schema: ObjectDataFilesProcessor.SupportedSchemas.DOTENV,
  validDataSpecification: {
    nameForLogging: "ConfigurationFromDotenv",
    subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
    properties: {
      IP_ADDRESS: {
        type: String,
        required: false
      },
      HTTP_PORT: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
        type: Number,
        numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger,
        required: false
      }
    }
  }
});


ConfigRepresentative.initialize(configFromDotEnvFile);


Server.initializeAndStart({
  IP_Address: ConfigRepresentative.IP_Address,
  HTTP: { port: ConfigRepresentative.HTTP_Port },
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

Now you can import **ConfigRepresentative** to classes like controllers and access to public getters.
If we forget to initialize the **ConfigRepresentative**, the application will crash before server starts.
But with below TypeScript configuration

```json
{
  "compilerOptions": {

    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "experimentalDecorators": true
  }
}
```

if we comment out `ConfigRepresentative.initialize(configFromDotEnvFile);` line, the TypeScript compiling
will crush with 

```
TSError: ⨯ Unable to compile TypeScript:
EntryPoint.ts:13:7 - error TS6133: 'configFromDotEnvFile' is declared but its value is never read.
```

error.

Well, everything is work. Let us review critically the code of **ConfigRepresentative**.

We should not define the defaults inside this class - the defaults should be defined in specialized file.
Because defaults are being changed not frequently, the TypeScript file is O'K.

Also, the **ConfigRepresentative** is merging the variables from **Dotenv** file and defaults.
It is all right for the draft code, but it is not the purpose of **Config representative** pattern.

We will fix above issues in next lesson where one more factor will appear - the configuration from the console.

