import type CategoryGateway from "@Gateways/CategoryGateway";

import {
  isNull,
  Logger,
  ClassRequiredInitializationHasNotBeenExecutedError
} from "@yamato-daiwa/es-extensions";


export interface FrontServerDependencies {
  gateways: FrontServerDependencies.Gateways;
}

export namespace FrontServerDependencies {
  export interface Gateways {
    category: CategoryGateway;
  }
}


export default abstract class FrontServerDependenciesInjector {

  private static dependencies: FrontServerDependencies | null = null;

  public static setDependencies(dependencies: FrontServerDependencies): void {
    FrontServerDependenciesInjector.dependencies = dependencies;
  }

  private static getDependencies(): FrontServerDependencies {

    if (isNull(FrontServerDependenciesInjector.dependencies)) {
      Logger.throwErrorAndLog({
        errorInstance: new ClassRequiredInitializationHasNotBeenExecutedError({
          className: "FrontServerDependenciesInjector",
          initializingMethodName: "getDependencies"
        }),
        occurrenceLocation: "FrontServerDependenciesInjector.[dependency] -> " +
            "FrontServerDependenciesInjector.getDependencies(parametersObject)",
        title: ClassRequiredInitializationHasNotBeenExecutedError.localization.defaultTitle
      });
    }

    return FrontServerDependenciesInjector.dependencies;
  }

  public static get gateways(): FrontServerDependencies.Gateways {
    return FrontServerDependenciesInjector.getDependencies().gateways;
  }
}
