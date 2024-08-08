import type Server from "../Server/Server";

import {
  isUndefined,
  isNotUndefined
} from "@yamato-daiwa/es-extensions";


export default function getSubdomainConfig(
  {
    subdomainsOfMainDomain__fromTopmostLevel,
    subdomainsNormalizedConfig
  }:
  {
    subdomainsOfMainDomain__fromTopmostLevel: Array<string>;
    subdomainsNormalizedConfig?: Server.NormalizedConfiguration.Subdomains.TreeNodes;
  }
): Server.NormalizedConfiguration.Subdomains.ConfigMatch | null {

  if (
    subdomainsOfMainDomain__fromTopmostLevel.length === 0 ||
    isUndefined(subdomainsNormalizedConfig)
  ) {
    return null;
  }


  const parameterizedHostNameLabels: Server.NormalizedConfiguration.Subdomains.ParameterizedHostNameLabels = {};
  let subdomainsTheeNodesForCurrentDomainLevel: Server.NormalizedConfiguration.Subdomains.TreeNodes = subdomainsNormalizedConfig;


  for (const [ index, hostnameLabel ] of subdomainsOfMainDomain__fromTopmostLevel.entries()) {

    // Console.log(`--- ${index} : ${hostnameLabel} ---------------------------------------------------------------------`);

    const isLastHostnameLabel: boolean = index + 1 === subdomainsOfMainDomain__fromTopmostLevel.length;

    if (isLastHostnameLabel) {

      const matchByStaticLabel: Server.NormalizedConfiguration.Subdomain | undefined =
          subdomainsTheeNodesForCurrentDomainLevel.staticLabels[hostnameLabel]?.match;

      if (isNotUndefined(matchByStaticLabel)) {
        return {
          config: matchByStaticLabel,
          parameterizedHostNameLabels_Values: parameterizedHostNameLabels
        };
      }


      const dynamicLabelNode: Server.NormalizedConfiguration.Subdomains.DynamicLabelNode | undefined =
          subdomainsTheeNodesForCurrentDomainLevel.dynamicLabel;
      const matchByParameter: Server.NormalizedConfiguration.Subdomain | undefined = dynamicLabelNode?.match;


      if (isNotUndefined(dynamicLabelNode) && isNotUndefined(matchByParameter)) {

        parameterizedHostNameLabels[dynamicLabelNode.name] = hostnameLabel;

        return {
          config: matchByParameter,
          parameterizedHostNameLabels_Values: parameterizedHostNameLabels
        };
      }
    }


    const staticLabelsNodesForNextLevel: Server.NormalizedConfiguration.Subdomains.TreeNodes | undefined =
        subdomainsTheeNodesForCurrentDomainLevel.staticLabels[hostnameLabel]?.children;
    let nodesForNextLevel: Server.NormalizedConfiguration.Subdomains.TreeNodes | undefined;

    if (isNotUndefined(staticLabelsNodesForNextLevel)) {
      nodesForNextLevel = staticLabelsNodesForNextLevel;
    } else if (isNotUndefined(subdomainsTheeNodesForCurrentDomainLevel.dynamicLabel)) {
      nodesForNextLevel = subdomainsTheeNodesForCurrentDomainLevel.dynamicLabel.children;
    } else {

      const dynamicLabelNodeForNextLevel: Server.NormalizedConfiguration.Subdomains.DynamicLabelNode = {
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
