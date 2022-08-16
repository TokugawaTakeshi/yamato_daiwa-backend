/* --- Application business rules --------------------------------------------------------------------------------- */
import type ProductGateway from "@Gateways/ProductGateway";

/* --- Data --------------------------------------------------------------------------------------------------------- */
import routing from "./Routing/router";
import CategoryMockGateway from "@MockDataSource/Gateways/CategoryMockGateway";

/* --- GUI Components ------------------------------------------------------------------------------------------------ */
import RootComponent from "./RootComponent.vue";

/* --- Services ----------------------------------------------------------------------------------------------------- */
import FetchAPI_Service from "./Services/FetchAPI_Service";

/* --- Framework ---------------------------------------------------------------------------------------------------- */
import { createApp as createVueApplication } from "vue";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import { Logger } from "@yamato-daiwa/es-extensions";
import { BasicFrontEndLogger } from "@yamato-daiwa/es-extensions-browserjs";
import ClientDependenciesInjector from "@Client/ClientDependenciesInjector";


(function executeApplication(): void {

  Logger.setImplementation(BasicFrontEndLogger);


  FetchAPI_Service.setAPI_ServerURI_ConstantPart("http://127.0.0.1:80/api");

  ClientDependenciesInjector.initialize({
    gateways: {
      category: new CategoryMockGateway(),
      product: async (): ClientDependenciesInjector.AsynchronousImplementation<ProductGateway> =>
          (await import("@MockDataSource/Gateways/ProductMockGateway")).default
    }
  });

  createVueApplication(RootComponent).
      use(routing).
      mount("#APPLICATION");

})();
