/* eslint-disable @typescript-eslint/member-ordering --
* In this class, the public static getter and methods are being semantically grouped. */

/* --- Application business rules ----------------------------------------------------------------------------------- */
import type CategoryGateway from "@Gateways/CategoryGateway";
import type ProductGateway from "@Gateways/ProductGateway";

/* --- Utils -------------------------------------------------------------------------------------------------------- */
import {
  Logger,
  ClassRedundantSubsequentInitializationError,
  ClassRequiredInitializationHasNotBeenExecutedError,
  isNull,
  isNotNull
} from "@yamato-daiwa/es-extensions";


class ClientDependenciesInjector {

  private static selfSoleInstance: ClientDependenciesInjector | null = null;


  private readonly categoryGateway: CategoryGateway;

  private productGateway: ProductGateway | null = null;
  private readonly productGatewayClassLoader: ClientDependenciesInjector.ImplementationLoader<ProductGateway>;


  public static initialize(dependencies: ClientDependenciesInjector.DependenciesInitialization): void {

    if (isNotNull(ClientDependenciesInjector.selfSoleInstance)) {
      Logger.throwErrorAndLog({
        errorInstance: new ClassRedundantSubsequentInitializationError({ className: "ClientDependenciesInjector" }),
        title: ClassRedundantSubsequentInitializationError.localization.defaultTitle,
        occurrenceLocation: "ClientDependenciesInjector.initialize(dependencies)"
      });
    }


    ClientDependenciesInjector.selfSoleInstance = new ClientDependenciesInjector(dependencies);

  }


  private constructor(dependencies: ClientDependenciesInjector.DependenciesInitialization) {
    this.categoryGateway = dependencies.gateways.category;
    this.productGatewayClassLoader = dependencies.gateways.product;
  }


  public static get categoryGateway(): CategoryGateway {
    return ClientDependenciesInjector.getExpectedHasBeenInitializedSelfSoleInstance().categoryGateway;
  }

  public static async loadProductGateway(): Promise<ProductGateway> {

    const selfInstance: ClientDependenciesInjector = ClientDependenciesInjector.
        getExpectedHasBeenInitializedSelfSoleInstance();

    if (isNull(selfInstance.productGateway)) {
      selfInstance.productGateway = new (await selfInstance.productGatewayClassLoader())();
    }

    return selfInstance.productGateway;

  }


  private static getExpectedHasBeenInitializedSelfSoleInstance(): ClientDependenciesInjector {

    if (isNull(ClientDependenciesInjector.selfSoleInstance)) {
      Logger.throwErrorAndLog({
        errorInstance: new ClassRequiredInitializationHasNotBeenExecutedError({
          className: "ExperimentalDependenciesInjector",
          initializingMethodName: "initialize"
        }),
        title: ClassRequiredInitializationHasNotBeenExecutedError.localization.defaultTitle,
        occurrenceLocation: "ClientDependenciesInjector.getExpectedHasBeenInitializedSelfSoleInstance()"
      });
    }


    return ClientDependenciesInjector.selfSoleInstance;

  }

}


namespace ClientDependenciesInjector {

  export type DependenciesInitialization = Readonly<{
    gateways: Readonly<{
      category: CategoryGateway;
      product: ImplementationLoader<ProductGateway>;
    }>;
  }>;

  export type AsynchronousImplementation<Abstraction> = Promise<new () => Abstraction>;
  export type ImplementationLoader<Abstraction> = () => AsynchronousImplementation<Abstraction>;

}


export default ClientDependenciesInjector;
