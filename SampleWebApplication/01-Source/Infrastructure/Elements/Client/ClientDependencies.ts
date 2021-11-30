import type CategoryGateway from "@Gateways/CategoryGateway";
// import type ProductGateway from "@Gateways/ProductGateway";

import {
  isNull,
  Logger,
  ClassRequiredInitializationHasNotBeenExecutedError
} from "@yamato-daiwa/es-extensions";


export interface ClientDependencies {
  readonly gateways: ClientDependencies.Gateways;
}

namespace ClientDependencies {
  export interface Gateways {
    readonly category: CategoryGateway;
    // readonly product: ProductGateway;
  }
}


export default abstract class ClientDependenciesInjector {

  private static dependencies: ClientDependencies | null = null;

  public static setDependencies(dependencies: ClientDependencies): void {
    ClientDependenciesInjector.dependencies = dependencies;
  }

  private static getDependencies(): ClientDependencies {

    if (isNull(ClientDependenciesInjector.dependencies)) {
      Logger.throwErrorAndLog({
        errorInstance: new ClassRequiredInitializationHasNotBeenExecutedError({
          className: "ClientDependenciesInjector",
          initializingMethodName: "setDependencies"
        }),
        title: ClassRequiredInitializationHasNotBeenExecutedError.localization.defaultTitle,
        occurrenceLocation: "ClientDependenciesInjector.getDependencies()"
      });
    }


    return ClientDependenciesInjector.dependencies;
  }


  public static get gateways(): ClientDependencies.Gateways {
    return ClientDependenciesInjector.getDependencies().gateways;
  }
}
