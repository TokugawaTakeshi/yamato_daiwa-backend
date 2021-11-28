import {
  HTTP_Methods,
  isUndefined,
  isNotUndefined,
  removeNthCharacter
} from "@yamato-daiwa/es-extensions";
import removeSlashes from "../Utils/removeSlashes";

import Request from "../Request";
import Response from "../Response/Response";
import Controller, { ControllerInheritingClass } from "../Controller/Controller";


abstract class Router {

  public static normalizeRouting(routesAndHandlersData: Router.RawRouting): Router.NormalizedRouting {

    const normalizedRouting: Router.NormalizedRouting = {
      [HTTP_Methods.get]: {},
      [HTTP_Methods.post]: {},
      [HTTP_Methods.create]: {},
      [HTTP_Methods.put]: {},
      [HTTP_Methods.delete]: {},
      [HTTP_Methods.options]: {},
      [HTTP_Methods.head]: {},
      [HTTP_Methods.connect]: {},
      [HTTP_Methods.trace]: {},
      [HTTP_Methods.patch]: {}
    };

    const mappedRoutesAndHandlers: Map<Router.Route, Router.RouteHandler> = new Map<Router.Route, Router.RouteHandler>();

    for (const arrayElement of routesAndHandlersData) {

      if ("handler" in arrayElement) {

        const routeAndHandlerPair: Router.RouteAndHandlerPair = arrayElement;
        mappedRoutesAndHandlers.set(routeAndHandlerPair.route, routeAndHandlerPair.handler);

      } else {

        const SpecificControllerClass: new () => Controller = arrayElement;
        const controller: Controller = new SpecificControllerClass();

        for (const [ route, handler ] of controller.getRoutesAndHandlers()) {
          mappedRoutesAndHandlers.set(route, handler.bind(controller));
        }
      }
    }


    for (const [ route, handler ] of mappedRoutesAndHandlers.entries()) {

      const normalizedRoutesOfCurrentHTTP_Method: Router.NormalizedRoutesOfSpecificHTTP_Method = normalizedRouting[route.type];

      Router.addRouteAndHandlerPairToNormalizedRoutesOfSpecificHTTP_MethodMutableObject({
        normalizedRoutersOfSpecificHTTP_Method: normalizedRoutesOfCurrentHTTP_Method,
        route,
        handler
      });
    }

    return normalizedRouting;
  }


  public static getRouteMatch(request: Request, normalizedRouting: Router.NormalizedRouting): Router.RouteMatch | null {

    const matchesActualForCurrentHTTP_Method: Router.NormalizedRoutesOfSpecificHTTP_Method =
        normalizedRouting[request.HTTP_Method];
    const pathSegments: Array<string> = removeSlashes(request.URL.pathname, { leading: true, trailing: true }).split("/");
    const routeParameters: Router.RouteParameters = {};

    if (pathSegments.length === 1 && pathSegments[0].length === 0) {

      const handlerForPathOfCurrentLength: Router.RouteHandler | undefined =
          matchesActualForCurrentHTTP_Method["/"]?.handlerForPathOfCurrentLength;

      return isNotUndefined(handlerForPathOfCurrentLength) ? {
        handler: handlerForPathOfCurrentLength,
        routeParameters
      } : null;
    }


    let currentPathSegmentMatches: Router.NormalizedRoutingDataForSpecificPosition | undefined =
        matchesActualForCurrentHTTP_Method[pathSegments[0]];

    for (const [ index ] of pathSegments.entries()) {

      if (isUndefined(currentPathSegmentMatches)) {
        return null;
      }


      const isLastSegment: boolean = index === pathSegments.length - 1;

      if (isLastSegment) {

        if (isUndefined(currentPathSegmentMatches.handlerForPathOfCurrentLength)) {
          return null;
        }

        return {
          handler: currentPathSegmentMatches.handlerForPathOfCurrentLength,
          routeParameters
        };
      }


      const nextPathSegment: string = pathSegments[index + 1];
      const routingForStaticPathSegmentsAtNextPosition: Router.RoutingForStaticPathSegmentsAtNextPosition | undefined =
          currentPathSegmentMatches.routingForStaticPathSegmentsAtNextPosition;

      if (
        isNotUndefined(routingForStaticPathSegmentsAtNextPosition) &&
        isNotUndefined(routingForStaticPathSegmentsAtNextPosition[nextPathSegment])
      ) {
        currentPathSegmentMatches = routingForStaticPathSegmentsAtNextPosition[nextPathSegment];
        continue;
      }


      if (isNotUndefined(currentPathSegmentMatches.routingForRouteParameterAtNextPosition)) {
        routeParameters[currentPathSegmentMatches.routingForRouteParameterAtNextPosition.parameterName] = nextPathSegment;
        currentPathSegmentMatches = currentPathSegmentMatches.routingForRouteParameterAtNextPosition;
      }
    }

    return null;
  }


  private static addRouteAndHandlerPairToNormalizedRoutesOfSpecificHTTP_MethodMutableObject(
    {
      normalizedRoutersOfSpecificHTTP_Method,
      route,
      handler
    }: {
      normalizedRoutersOfSpecificHTTP_Method: Router.NormalizedRoutesOfSpecificHTTP_Method;
      route: Router.Route;
      handler: Router.RouteHandler;
    }
  ): void {

    if (route.pathTemplate === "/") {
      normalizedRoutersOfSpecificHTTP_Method["/"] = { handlerForPathOfCurrentLength: handler };
      return;
    }


    const pathSegments: Array<string> = removeSlashes(route.pathTemplate, { leading: true, trailing: true }).split("/");

    let normalizedRoutingDataForSpecificPosition: Router.NormalizedRoutingDataForSpecificPosition;
    const normalizedRoutingDataForFirstPathSegment: Router.NormalizedRoutingDataForSpecificPosition | undefined =
        normalizedRoutersOfSpecificHTTP_Method[pathSegments[0]];

    if (isNotUndefined(normalizedRoutingDataForFirstPathSegment)) {
      normalizedRoutingDataForSpecificPosition = normalizedRoutingDataForFirstPathSegment;
    } else {
      const normalizedRoutingDataForSpecificPosition__referableObject: Router.NormalizedRoutingDataForSpecificPosition = {};
      normalizedRoutersOfSpecificHTTP_Method[pathSegments[0]] = normalizedRoutingDataForSpecificPosition__referableObject;
      normalizedRoutingDataForSpecificPosition = normalizedRoutingDataForSpecificPosition__referableObject;
    }

    for (const [ index ] of pathSegments.entries()) {

      const isLastSegment: boolean = index === pathSegments.length - 1;

      if (isLastSegment) {
        normalizedRoutingDataForSpecificPosition.handlerForPathOfCurrentLength = handler;
        continue;
      }


      const pathSegmentAtNextPosition: string = pathSegments[index + 1];

      if (Router.isSegmentIsRouteParameter(pathSegmentAtNextPosition)) {

        if (isUndefined(normalizedRoutingDataForSpecificPosition.routingForRouteParameterAtNextPosition)) {
          normalizedRoutingDataForSpecificPosition.routingForRouteParameterAtNextPosition = {
            parameterName: removeNthCharacter(pathSegmentAtNextPosition, { targetCharacterNumber: 1, numerationFrom: 1 })
          };
          normalizedRoutingDataForSpecificPosition = normalizedRoutingDataForSpecificPosition.
              routingForRouteParameterAtNextPosition;
          continue;
        }

        normalizedRoutingDataForSpecificPosition = normalizedRoutingDataForSpecificPosition.
            routingForRouteParameterAtNextPosition;

        continue;
      }


      const routingForStaticPathSegmentsAtNextPosition: Router.RoutingForStaticPathSegmentsAtNextPosition | undefined =
          normalizedRoutingDataForSpecificPosition.routingForStaticPathSegmentsAtNextPosition;

      if (isUndefined(routingForStaticPathSegmentsAtNextPosition)) {

        const nextPathSegmentMatches: Router.NormalizedRoutingDataForSpecificPosition = {};

        normalizedRoutingDataForSpecificPosition.routingForStaticPathSegmentsAtNextPosition = {
          [pathSegmentAtNextPosition]: nextPathSegmentMatches
        };

        normalizedRoutingDataForSpecificPosition = nextPathSegmentMatches;
        continue;
      }


      let routingDataForStaticPathSegmentAtNextPosition: Router.NormalizedRoutingDataForSpecificPosition | undefined =
          routingForStaticPathSegmentsAtNextPosition[pathSegmentAtNextPosition];

      if (isUndefined(routingDataForStaticPathSegmentAtNextPosition)) {
        routingDataForStaticPathSegmentAtNextPosition = {};
        routingForStaticPathSegmentsAtNextPosition[pathSegmentAtNextPosition] = routingDataForStaticPathSegmentAtNextPosition;
        normalizedRoutingDataForSpecificPosition = routingDataForStaticPathSegmentAtNextPosition;
        continue;
      }


      normalizedRoutingDataForSpecificPosition = routingDataForStaticPathSegmentAtNextPosition;
    }
  }

  private static isSegmentIsRouteParameter(targetURL_Segment: string): boolean {
    return targetURL_Segment.startsWith(":");
  }
}


namespace Router {

  export type RawRouting = Array<ControllerInheritingClass | RouteAndHandlerPair>;

  export type Route = {
    type: HTTP_Methods;
    pathTemplate: string;
  };

  export type RouteMatch = {
    handler: RouteHandler;
    routeParameters: RouteParameters;
  };

  export type RouteHandler = (request: Request, response: Response, routeParameters: RouteParameters) => Promise<void>;

  export type RouteAndHandlerPair = { route: Route; handler: RouteHandler; };

  export type RouteParameters = { [key: string]: string; };

  export type NormalizedRouting = {
    [HTTP_Methods.get]: NormalizedRoutesOfSpecificHTTP_Method;
    [HTTP_Methods.post]: NormalizedRoutesOfSpecificHTTP_Method;
    [HTTP_Methods.create]: NormalizedRoutesOfSpecificHTTP_Method;
    [HTTP_Methods.put]: NormalizedRoutesOfSpecificHTTP_Method;
    [HTTP_Methods.delete]: NormalizedRoutesOfSpecificHTTP_Method;
    [HTTP_Methods.options]: NormalizedRoutesOfSpecificHTTP_Method;
    [HTTP_Methods.head]: NormalizedRoutesOfSpecificHTTP_Method;
    [HTTP_Methods.connect]: NormalizedRoutesOfSpecificHTTP_Method;
    [HTTP_Methods.trace]: NormalizedRoutesOfSpecificHTTP_Method;
    [HTTP_Methods.patch]: NormalizedRoutesOfSpecificHTTP_Method;
  };

  export type NormalizedRoutesOfSpecificHTTP_Method = {
    [ pathSegment: string]: NormalizedRoutingDataForSpecificPosition | undefined;
  };

  export type NormalizedRoutingDataForSpecificPosition = {
    handlerForPathOfCurrentLength?: RouteHandler;
    routingForStaticPathSegmentsAtNextPosition?: RoutingForStaticPathSegmentsAtNextPosition;
    routingForRouteParameterAtNextPosition?: RoutingForRouteParameterAtNextPosition;
  };

  export type RoutingForStaticPathSegmentsAtNextPosition = {
    [pathSegment: string]: NormalizedRoutingDataForSpecificPosition | undefined;
  };
  export type RoutingForRouteParameterAtNextPosition = NormalizedRoutingDataForSpecificPosition & { parameterName: string; };
}


export default Router;
