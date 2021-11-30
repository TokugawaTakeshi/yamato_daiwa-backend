import Server from "../Server/Server";

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
    subdomainsNormalizedConfig?: Server.NormalizedConfig.Subdomains.TreeNodes;
  }
): Server.NormalizedConfig.Subdomains.ConfigMatch | null {

  if (
    subdomainsOfMainDomain__fromTopmostLevel.length === 0 ||
    isUndefined(subdomainsNormalizedConfig)
  ) {
    return null;
  }


  const parameterizedHostNameLabels: Server.NormalizedConfig.Subdomains.ParameterizedHostNameLabels = {};
  let subdomainsTheeNodesForCurrentDomainLevel: Server.NormalizedConfig.Subdomains.TreeNodes = subdomainsNormalizedConfig;


  for (const [ index, hostnameLabel ] of subdomainsOfMainDomain__fromTopmostLevel.entries()) {

    // Console.log(`--- ${index} : ${hostnameLabel} ---------------------------------------------------------------------`);

    const isLastHostnameLabel: boolean = index + 1 === subdomainsOfMainDomain__fromTopmostLevel.length;

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
