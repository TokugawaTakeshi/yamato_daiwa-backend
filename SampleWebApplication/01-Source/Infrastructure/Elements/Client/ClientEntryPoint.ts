/* --- Data --------------------------------------------------------------------------------------------------------- */
import routing from "./Routing/router";
import CategoryFetchAPI_Gateway from "./Data/FromServer/Gateways/CategoryFetchAPI_Gateway";

/* --- Other components --------------------------------------------------------------------------------------------- */
import RootComponent from "./RootComponent.vue";

/* --- Services ----------------------------------------------------------------------------------------------------- */
import FetchAPI_Service from "./Service/FetchAPI_Service";

/* --- Framework ---------------------------------------------------------------------------------------------------- */
import { createApp as createVueApplication } from "vue";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import { Logger } from "@yamato-daiwa/es-extensions";
import { BasicFrontEndLogger } from "@yamato-daiwa/es-extensions-browserjs";
import ClientDependenciesInjector from "./ClientDependencies";


(function executeApplication(): void {

  Logger.setImplementation(BasicFrontEndLogger);

  FetchAPI_Service.setAPI_ServerURI_ConstantPart("http://127.0.0.1:80/api");

  ClientDependenciesInjector.setDependencies({
    gateways: {
      category: new CategoryFetchAPI_Gateway()
    }
  });

  createVueApplication(RootComponent).
      use(routing).
      mount("#APPLICATION");

})();
