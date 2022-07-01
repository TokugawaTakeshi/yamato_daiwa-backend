import ArticleController from "./Controllers/ArticleController";

import { Server } from "../../../Source";


/* [ Execution ] cd Tests/Views; nodemon Views.test.ts */
(function runApplication(): void {

  Server.initializeAndStart({
    IP_Address: "127.0.0.1",
    HTTP: { port: 1337 },
    routing: [ ArticleController ]
  });

})();
