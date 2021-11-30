import type Router from "../Router";
import { Logger, ImproperUsageError, isUndefined } from "@yamato-daiwa/es-extensions";
import { ControllerLocalizer } from "./ControllerLocalization";


export default abstract class Controller {

  /* eslint-disable-next-line @typescript-eslint/prefer-readonly --
  * '@typescript-eslint' does not see that 'routesAndHandlersMap' is being used inside 'RouteHandler',
  * however if mark 'routesAndHandlersMap' as 'readonly', it will be the TypeScript error.
  * */
  private routesAndHandlersMap!: Map<Router.Route, Router.RouteHandler>;

  public static RouteHandler<SpecificController extends Controller>(
    route: Router.Route
  ): (controllerPrototype: SpecificController, methodName: string) => void {

    return (controllerPrototype: SpecificController, methodName: string): void => {

      if (!Object.prototype.isPrototypeOf.call(Controller.prototype, controllerPrototype)) {
        Logger.throwErrorAndLog({
          errorInstance: new ImproperUsageError(ControllerLocalizer.localization.errors.invalidTargetForRouteHandlerDecorator),
          occurrenceLocation: "Controller.RouteHandler",
          title: ImproperUsageError.localization.defaultTitle
        });
      }


      if (isUndefined(controllerPrototype.routesAndHandlersMap)) {
        controllerPrototype.routesAndHandlersMap = new Map<Router.Route, Router.RouteHandler>();
      }


      /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
      * In the TypeScript documentation (https://www.typescriptlang.org/docs/handbook/decorators.html), the first parameter
      * designated as "target" has "any" type, but we know that this decorator function will be applied to some inheritor of
      * "Controller" class. It means, the method with name "methodName" must present on "SpecificController" type, but because
      * this name is unknown at advance we could not invoke it type-safely and forces to use type assertion. */
      const handler: Router.RouteHandler = (controllerPrototype as unknown as {
        [methodName: string]: Router.RouteHandler;
      })[methodName];

      controllerPrototype.routesAndHandlersMap.set(route, handler);
    };
  }

  public getRoutesAndHandlers(): Array<[ Router.Route, Router.RouteHandler ]> {
    return Array.from(this.routesAndHandlersMap.entries());
  }
}


export type ControllerInheritingClass = new () => Controller;
