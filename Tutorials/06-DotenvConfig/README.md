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

First of all, the Node.js has not native functionality for the working with **.env** files -
only third-party solutions.

Next, the parsed variables are frequently not just being imported - they are also being merged with 
[**process.env**](https://nodejs.org/dist/latest-v8.x/docs/api/process.html#process_process_env).
Although this practice is being occurred, it is not recommended to merge it:

> Littering it through out a project could lead to maintenance issues as it's another kind of global dependency. 
As such, it could lead to merge conflicts in a multi-user setup and deployment issues in a multi-server setup. 
Instead, one of the best practices is to define all those parameters in a single configuration/settings file which could
be accessed throughout the project.
>
> [The documentation to **eslint-plugin-node**](https://github.com/mysticatea/eslint-plugin-node/blob/master/docs/rules/no-process-env.md)

On this account, YDB does not suggest the functionality of merging of .env variables from file with **process.env**.
If you are critically need this functionality, use the third-party solutions like [dotenv](https://www.npmjs.com/package/dotenv).


### Managing of the sensitive data

**.env** files could contain some sensitive data like credential for the database.
To reduce the probability of data leaking, the version controls systems like **Git** are being frequently set
to ignore the files like **.env**, herewith the **.env** must be provided directly by the project leader.

Also, the sample **.env** is being provided (usually **.env.example**). 
It has dummy values the leaking of which is not dangerous thus no need to ignore it by versions control system.


### Why not type-safe config in TypeScript files?

Well, it is the option. 
Some frameworks like [Nuxt.js](https://nuxtjs.org) support the configuration files written by TypeScript 
(with [appropriate plugins](https://typescript.nuxtjs.org), off course). 

What it not good is if we change the configuration, we need to rebuild the project.
It is not the problem for the small project, but as far as the project become larger, the rebuilding takes
more time and efforts (the Continuous Integration could automate some routines, but it still takes some time).

The usage of [ts-node](https://www.npmjs.com/package/ts-node) solves the problems with rebuilding, 
but we should to support the scenario when transpiled JavaScript is being executed by Node.js.


## Practice

As it was mentioned above, there is no native Node.js functionality for the working with **.env** files.
From our side, we are suggesting the **ObjectDataFilesProcessor** with the library 
[@yamato-daiwa/es-extensions-nodejs](https://www.npmjs.com/package/@yamato-daiwa/es-extensions-nodejs).

It works with YAML, JSON and dotenv, so the config could be defined by any of theese formats.
It also validates imported data using [RawObjectDataProcessor](https://github.com/TokugawaTakeshi/Yamato-Daiwa-ES-Extensions/blob/master/CoreLibrary/Package/Documentation/RawObjectDataProcessor/RawObjectDataProcessor.md).


### Importing of the configuration


### Defining of the defaults


### Accessing to the configuration from everywhere in application


