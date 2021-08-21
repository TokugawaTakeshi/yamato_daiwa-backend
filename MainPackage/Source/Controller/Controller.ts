import Router from "../Router/Router";
import { isUndefined, ImproperUsageError, Logger } from "@yamato-daiwa/es-extensions";


export default abstract class Controller {

  /* 〔 ESLint muting rationale 〕 '@typescript-eslint' does not see that 'routesAndHandlersMap' is being used inside
  *     'RouteHandler', however if mark 'routesAndHandlersMap' as 'readonly', it will be the TypeScript error. */
  /* eslint-disable-next-line @typescript-eslint/prefer-readonly */
  private routesAndHandlersMap!: Map<Router.Route, Router.RouteHandler>;

  public static RouteHandler<SpecificController extends Controller>(
    route: Router.Route
  ): (controllerPrototype: SpecificController, methodName: string) => void {

    return (controllerPrototype: SpecificController, methodName: string): void => {

      if (!Object.prototype.isPrototypeOf.call(Controller.prototype, controllerPrototype)) {
        Logger.throwErrorAndLog({
          errorInstance: new ImproperUsageError(
            "'@Controller.RouteHandler' is intended to be used as decorator for non-static methods of 'Controller' class " +
            "inheritors"
          ),
          occurrenceLocation: "@Controller.RouteHandler",
          title: ImproperUsageError.DEFAULT_TITLE
        });
      }

      if (isUndefined(controllerPrototype.routesAndHandlersMap)) {
        controllerPrototype.routesAndHandlersMap = new Map<Router.Route, Router.RouteHandler>();
      }

      /* 〔 Theory 〕 In this case, the "methodName" must be in "controllerPrototype" instance as long as this function is being
      *     used as decorator for "Controller" inheritor. */
      const handler: Router.RouteHandler =
          (controllerPrototype as unknown as { [methodName: string]: Router.RouteHandler; })[methodName];

      controllerPrototype.routesAndHandlersMap.set(route, handler);
    };
  }

  public getRoutesAndHandlers(): Array<[ Router.Route, Router.RouteHandler ]> {
    return Array.from(this.routesAndHandlersMap.entries());
  }
}


export type ControllerInheritingClass = new () => Controller;
