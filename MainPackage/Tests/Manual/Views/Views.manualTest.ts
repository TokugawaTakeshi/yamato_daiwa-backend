import ArticleController from "./Controllers/ArticleController";

import { Server } from "../../../Source";
import { Logger } from "@yamato-daiwa/es-extensions";

import ConsoleApplicationLogger from "../../../Source/UtilsIncubator/ConsoleApplicationLogger";


/* [ Execution ] cd Tests/Views; nodemon Views.test.ts */
(function runApplication(): void {

  Logger.setImplementation(ConsoleApplicationLogger);

  Server.initializeAndStart({
    IP_Address: "127.0.0.1",
    HTTP: { port: 1337 },
    routing: [ ArticleController ]
  });

})();
