/* eslint max-depth: [ "error", 4 ] */

import Server from "../Server";
import HTTP from "http";
import Router from "../Router/Router";
import {
  isNotUndefined,
  isUndefined,
  removeAllSpecifiedCharacters,
  splitString,
  Logger, getLastElementOfNonEmptyArray
} from "@yamato-daiwa/es-extensions";
// import NativeUtilities from "util";


export default class SubdomainsHelper {

  public static normalizeSubdomainsConfig(
    {
      rawSubdomainsConfig,
      defaultRouting
    }: {
      rawSubdomainsConfig: Server.RawConfig.Subdomains | undefined;
      defaultRouting: Router.NormalizedRouting;
    }
  ): Server.NormalizedConfig.Subdomains | null {

    if (isUndefined(rawSubdomainsConfig) || Object.entries(rawSubdomainsConfig).length === 0) {
      return null;
    }


    const subdomainsNormalizedConfig: Server.NormalizedConfig.Subdomains = { staticLabels: {} };
    let nodesOfCurrentDepthLevel: Server.NormalizedConfig.Subdomains.TreeNodes = subdomainsNormalizedConfig;

    for (const [ subdomainPattern, subdomainRawConfig ] of Object.entries(rawSubdomainsConfig)) {

      const subdomainPatternExplodedToLabels: Array<string> = splitString(subdomainPattern, ".").reverse();
      const subdomainPatternLabelsCount: number = subdomainPatternExplodedToLabels.length;

      for (const [ index, currentHostNameLabel ] of subdomainPatternExplodedToLabels.entries()) {

        // console.log(`--- ${index} : ${currentHostNameLabel} -------------------------------------------------------`);

        const isLastLabel: boolean = index + 1 === subdomainPatternLabelsCount;

        if (isLastLabel) {

          if (SubdomainsHelper.isSubdomainLabelTheParameter(currentHostNameLabel)) {
            nodesOfCurrentDepthLevel.dynamicLabel = {
              match: {
                routing: isNotUndefined(subdomainRawConfig.routing) ?
                    Router.normalizeRouting(subdomainRawConfig.routing) : defaultRouting
              },
              name: SubdomainsHelper.extractDynamicSubdomainLabelName(currentHostNameLabel),
              children: { staticLabels: {} }
            };
            break;
          }


          nodesOfCurrentDepthLevel.staticLabels[currentHostNameLabel] = {
            match: {
              routing: isNotUndefined(subdomainRawConfig.routing) ?
                  Router.normalizeRouting(subdomainRawConfig.routing) : defaultRouting
            },
            children: { staticLabels: {} }
          };

          break;
        }


        const nextHostNameLabel: string = subdomainPatternExplodedToLabels[index + 1];
        const isNextLabelTheOptionalParameter: boolean = SubdomainsHelper.isSubdomainLabelAnOptionalParameter(nextHostNameLabel);

        if (isNextLabelTheOptionalParameter) {

          if (SubdomainsHelper.isSubdomainLabelTheParameter(currentHostNameLabel)) {
            nodesOfCurrentDepthLevel.dynamicLabel = {
              match: {
                routing: isNotUndefined(subdomainRawConfig.routing) ?
                    Router.normalizeRouting(subdomainRawConfig.routing) : defaultRouting
              },
              name: SubdomainsHelper.extractDynamicSubdomainLabelName(currentHostNameLabel),
              children: { staticLabels: {} }
            };
          }

          nodesOfCurrentDepthLevel.staticLabels[currentHostNameLabel] = {
            match: {
              routing: isNotUndefined(subdomainRawConfig.routing) ?
                  Router.normalizeRouting(subdomainRawConfig.routing) : defaultRouting
            },
            children: { staticLabels: {} }
          };
        }


        if (!SubdomainsHelper.isSubdomainLabelTheParameter(currentHostNameLabel)) {

          const currentStaticLabelExistingNode: Server.NormalizedConfig.Subdomains.StaticLabelNode | undefined =
              nodesOfCurrentDepthLevel.staticLabels[currentHostNameLabel];

          let currentStaticLabelNode: Server.NormalizedConfig.Subdomains.StaticLabelNode;

          if (isNotUndefined(currentStaticLabelExistingNode)) {
            currentStaticLabelNode = currentStaticLabelExistingNode;
          } else {
            currentStaticLabelNode = {
              children: { staticLabels: {} }
            };
            nodesOfCurrentDepthLevel.staticLabels[currentHostNameLabel] = currentStaticLabelNode;
          }

          nodesOfCurrentDepthLevel = currentStaticLabelNode.children;
        }
      }
    }

    // console.log(NativeUtilities.inspect(subdomainsNormalizedConfig, { depth: null }));

    return subdomainsNormalizedConfig;
  }

  public static getSubdomainConfig(
    request: HTTP.IncomingMessage, subdomainsNormalizedConfig?: Server.NormalizedConfig.Subdomains
  ): Server.NormalizedConfig.Subdomains.ConfigMatch | null {

    if (isUndefined(subdomainsNormalizedConfig)) {
      return null;
    }


    /* [ Reference ]  https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host */
    const hostHTTP_Header: string | undefined = request.headers.host;

    if (isUndefined(hostHTTP_Header)) {
      return null;
    }


    const hostNameExplodedToLabels: Array<string> = splitString(hostHTTP_Header, ".");

    if (hostNameExplodedToLabels.length < 2) {
      Logger.logWarning({
        title: "Invalid HOST HTTP header",
        description: "At least two labels divided by '.' expected in Host HTTP header while actual value " +
            `is '${hostHTTP_Header}'.`,
        occurrenceLocation: "server.getSubdomainConfig(request)"
      });
      return null;
    }


    const lastHostNameLabel: string = getLastElementOfNonEmptyArray(hostNameExplodedToLabels);
    let actualHostNameLabelsFromLowestActualDomain: Array<string>;

    if (lastHostNameLabel.match(/^localhost/gu)) {
      /* [ Example ] [ "ja", "developer", "localhost:3000" ] -> [ "developer", "ja" ] */
      actualHostNameLabelsFromLowestActualDomain = hostNameExplodedToLabels.slice(0, -1).reverse();
    } else {
      const ELEMENTS_WILL_BE_REMOVED_FROM_END: number = 2;
      /* [ Example ] [ "ja", "foo", "yamatodaiwa", "com" ] -> [ "foo", "ja" ] */
      actualHostNameLabelsFromLowestActualDomain = hostNameExplodedToLabels.
      slice(0, -ELEMENTS_WILL_BE_REMOVED_FROM_END).reverse();
    }


    const parameterizedHostNameLabels: Server.NormalizedConfig.Subdomains.ParameterizedHostNameLabels = {};
    let subdomainsTheeNodesForCurrentDomainLevel: Server.NormalizedConfig.Subdomains.TreeNodes = subdomainsNormalizedConfig;


    for (const [ index, hostnameLabel ] of actualHostNameLabelsFromLowestActualDomain.entries()) {

      // console.log(`--- ${index} : ${hostnameLabel} ---------------------------------------------------------------`);

      const isLastHostnameLabel: boolean = index + 1 === actualHostNameLabelsFromLowestActualDomain.length;

      if (isLastHostnameLabel) {

        const matchByStaticLabel: Server.NormalizedConfig.Subdomain | undefined =
            subdomainsTheeNodesForCurrentDomainLevel.staticLabels[hostnameLabel]?.match;

        if (isNotUndefined(matchByStaticLabel)) {
          return {
            config: matchByStaticLabel,
            parameterizedHostNameLabels_Values: parameterizedHostNameLabels
          };
        }


        const dynamicLabelNode: Server.NormalizedConfig.Subdomains.DynamicLabelNode | undefined =
            subdomainsTheeNodesForCurrentDomainLevel?.dynamicLabel;
        const matchByParameter: Server.NormalizedConfig.Subdomain | undefined = dynamicLabelNode?.match;


        if (isNotUndefined(dynamicLabelNode) && isNotUndefined(matchByParameter)) {

          parameterizedHostNameLabels[dynamicLabelNode.name] = hostnameLabel;

          return {
            config: matchByParameter,
            parameterizedHostNameLabels_Values: parameterizedHostNameLabels
          };
        }
      }


      const staticLabelsNodesForNextLevel: Server.NormalizedConfig.Subdomains.TreeNodes | undefined =
          subdomainsTheeNodesForCurrentDomainLevel.staticLabels[hostnameLabel]?.children;
      let nodesForNextLevel: Server.NormalizedConfig.Subdomains.TreeNodes | undefined;

      if (isNotUndefined(staticLabelsNodesForNextLevel)) {
        nodesForNextLevel = staticLabelsNodesForNextLevel;
      } else if (isNotUndefined(subdomainsTheeNodesForCurrentDomainLevel.dynamicLabel)) {
        nodesForNextLevel = subdomainsTheeNodesForCurrentDomainLevel.dynamicLabel.children;
      } else {

        const dynamicLabelNodeForNextLevel: Server.NormalizedConfig.Subdomains.DynamicLabelNode = {
          name: hostnameLabel,
          children: { staticLabels: {} }
        };

        subdomainsTheeNodesForCurrentDomainLevel.dynamicLabel = dynamicLabelNodeForNextLevel;
        nodesForNextLevel = dynamicLabelNodeForNextLevel.children;
      }

      subdomainsTheeNodesForCurrentDomainLevel = nodesForNextLevel;
    }


    return null;
  }


  private static isSubdomainLabelTheParameter(subdomainLabel: string): boolean {
    return subdomainLabel.startsWith(":");
  }

  private static isSubdomainLabelAnOptionalParameter(subdomainLabel: string): boolean {
    return subdomainLabel.startsWith(":") && subdomainLabel.endsWith("?");
  }

  private static extractDynamicSubdomainLabelName(dynamicSubdomainNotation: string): string {
    return removeAllSpecifiedCharacters(dynamicSubdomainNotation, [ ":", "?" ]);
  }
}
