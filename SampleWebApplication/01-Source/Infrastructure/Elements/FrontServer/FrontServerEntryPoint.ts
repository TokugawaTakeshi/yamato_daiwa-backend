import CategoryController from "./Controllers/CategoryController";

import FrontServerDependenciesInjector from "./FrontServerDependencies";
import CategoryMockGateway from "@MockDataSource/Gateways/CategoryMockGateway";

import { Server, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { Logger } from "@yamato-daiwa/es-extensions";

import { ConsoleApplicationLogger } from "@yamato-daiwa/es-extensions-nodejs";


(function runApplication(): void {

  Logger.setImplementation(ConsoleApplicationLogger);

  FrontServerDependenciesInjector.setDependencies({
    gateways: {
      category: new CategoryMockGateway()
    }
  });

  Server.initializeAndStart({
    IP_Address: "127.0.0.1",
    HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
    routing: [
      CategoryController
    ]
  });

})();
