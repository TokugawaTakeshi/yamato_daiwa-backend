import Server from "../Server/Server";
import Router from "../Router";
import NormalizedConfig = Server.NormalizedConfig;

/* --- Default conventions ------------------------------------------------------------------------------------------ */
import URI_QueryParametersDefaultSerializer from "../DefaultConventions/URI_QueryParametersDefaultSerializer";

/* --- General auxiliaries ------------------------------------------------------------------------------------------ */
import Path from "path";
import {
  Logger,
  InvalidConfigError,
  isUndefined,
  isNotUndefined,
  splitString,
  removeAllSpecifiedCharacters
} from "@yamato-daiwa/es-extensions";
import isIPv4AddressLiesInRange from "../UtilsIncubator/isIPv4AddressLiesInRange";


export default class ConfigNormalizer {

  public static normalize(rawConfig: Server.RawConfig): Server.NormalizedConfig {

    if (isUndefined(rawConfig.HTTP) && isUndefined(rawConfig.HTTPS)) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidConfigError({
          customMessage: "Both HTTP and HTTPS settings has not been specified. Nothing to serve."
        }),
        title: InvalidConfigError.localization.defaultTitle,
        occurrenceLocation: "ConfigNormalizer.normalize(rawConfig)"
      });
    }

    return {
      IP_Address: rawConfig.IP_Address,
      ...ConfigNormalizer.normalizeHTTP_Config(rawConfig),
      ...ConfigNormalizer.normalizeHTTPS_Config(rawConfig),
      routing: Router.normalizeRouting(rawConfig.routing ?? []),
      publicDirectoriesAbsolutePaths: ConfigNormalizer.
          computePublicDirectoriesAbsolutePaths(rawConfig.publicDirectoriesAbsoluteOrRelativePaths),
      ...ConfigNormalizer.normalizeSubdomainsConfig(rawConfig),

      /* [ Theory ] We need to check does each specified domain matching with IP_Address, what is the asynchronous processing
      *     intended to be executed during server starting. Currently, there are asynchronous processing permitted in
      *     config normalizer to not make the Server's constructor asynchronous. */
      basicDomains: ConfigNormalizer.normalizeBasicDomains(rawConfig),
      URI_QueryParametersMainDeserializer: rawConfig.URI_QueryParametersMainDeserializer ?? URI_QueryParametersDefaultSerializer
    };
  }


  private static normalizeHTTP_Config(rawConfig: Server.RawConfig): { HTTP: Server.NormalizedConfig.HTTP; } | null {

    const rawHTTP_Config: Server.RawConfig.HTTP | undefined = rawConfig.HTTP;

    if (isUndefined(rawHTTP_Config)) {
      return null;
    }


    return {
      HTTP: {
        IP_AddressBasedMainOrigin: `http://${ rawConfig.IP_Address }:${ rawHTTP_Config.port }`,
        port: rawHTTP_Config.port
      }
    };
  }

  private static normalizeHTTPS_Config(rawConfig: Server.RawConfig): { HTTPS: Server.NormalizedConfig.HTTPS; } | null {

    const rawHTTPS_Config: Server.RawConfig.HTTPS | undefined = rawConfig.HTTPS;

    if (isUndefined(rawHTTPS_Config)) {
      return null;
    }


    return {
      HTTPS: {
        IP_AddressBasedMainOrigin: `https://${ rawConfig.IP_Address }:${ rawHTTPS_Config.port }`,
        port: rawHTTPS_Config.port,
        SSL_KeyFileAbsolutePath: Path.isAbsolute(rawHTTPS_Config.SSL_KeyFileRelativeOrAbsolutePath) ?
            rawHTTPS_Config.SSL_KeyFileRelativeOrAbsolutePath :
            Path.resolve(process.cwd(), rawHTTPS_Config.SSL_KeyFileRelativeOrAbsolutePath),
        SSL_CertificateFileAbsolutePath: Path.isAbsolute(rawHTTPS_Config.SSL_CertificateFileRelativeOrAbsolutePath) ?
            rawHTTPS_Config.SSL_CertificateFileRelativeOrAbsolutePath :
            Path.resolve(process.cwd(), rawHTTPS_Config.SSL_CertificateFileRelativeOrAbsolutePath)
      }
    };
  }


  private static computePublicDirectoriesAbsolutePaths(
    publicDirectoriesAbsoluteOrRelativePaths?: ReadonlyArray<string>
  ): Array<string> {
    return (publicDirectoriesAbsoluteOrRelativePaths ?? []).map(
      (publicDirectoryAbsoluteOrRelativePath: string): string =>
          (
            Path.isAbsolute(publicDirectoryAbsoluteOrRelativePath) ?
                publicDirectoryAbsoluteOrRelativePath :
                Path.resolve(process.cwd(), Path.normalize(publicDirectoryAbsoluteOrRelativePath))
          )
    );
  }

  private static normalizeSubdomainsConfig(rawConfig: Server.RawConfig): { subdomains: NormalizedConfig.Subdomains; } | null {

    if (isUndefined(rawConfig.subdomains) || Object.entries(rawConfig.subdomains).length === 0) {
      return null;
    }


    const subdomainsNormalizedConfigWorkpiece: Server.NormalizedConfig.Subdomains = { staticLabels: {} };
    let nodesOfCurrentDepthLevel: Server.NormalizedConfig.Subdomains.TreeNodes = subdomainsNormalizedConfigWorkpiece;

    for (const [ subdomainPattern, subdomainRawConfig ] of Object.entries(rawConfig.subdomains)) {

      const subdomainPatternExplodedToLabels: Array<string> = splitString(subdomainPattern, ".").reverse();
      const labelsCountInSubdomainPattern: number = subdomainPatternExplodedToLabels.length;


      for (const [ index, currentHostNameLabel ] of subdomainPatternExplodedToLabels.entries()) {

        // Console.log(`--- ${labelNumber__numerationFrom1} : ${currentHostNameLabel} ------------------------------- `);
        const labelNumber__numerationFrom1: number = index + 1;
        const isLastLabel: boolean = labelNumber__numerationFrom1 === labelsCountInSubdomainPattern;

        if (isLastLabel) {

          if (ConfigNormalizer.isSubdomainLabelTheParameter(currentHostNameLabel)) {

            nodesOfCurrentDepthLevel.dynamicLabel = {
              match: {
                routing: Router.normalizeRouting(subdomainRawConfig.routing),
                publicDirectoriesAbsolutePaths: ConfigNormalizer.
                    computePublicDirectoriesAbsolutePaths(subdomainRawConfig.publicDirectoriesAbsoluteOrRelativePaths)
              },
              name: ConfigNormalizer.extractDynamicSubdomainLabelName(currentHostNameLabel),
              children: { staticLabels: {} }
            };

            break;
          }


          nodesOfCurrentDepthLevel.staticLabels[currentHostNameLabel] = {
            match: {
              routing: Router.normalizeRouting(subdomainRawConfig.routing),
              publicDirectoriesAbsolutePaths: ConfigNormalizer.
                  computePublicDirectoriesAbsolutePaths(subdomainRawConfig.publicDirectoriesAbsoluteOrRelativePaths)
            },
            children: { staticLabels: {} }
          };

          break;
        }


        const staticLabelNodeOfCurrentDepthLevel: Server.NormalizedConfig.Subdomains.StaticLabelNode | undefined =
            nodesOfCurrentDepthLevel.staticLabels[currentHostNameLabel];

        /* [ Mnemonic ] Create platform -> mount platform -> climb to platform */
        let currentStaticLabelNode: Server.NormalizedConfig.Subdomains.StaticLabelNode;

        if (isNotUndefined(staticLabelNodeOfCurrentDepthLevel)) {
          currentStaticLabelNode = staticLabelNodeOfCurrentDepthLevel;
        } else {
          currentStaticLabelNode = {
            children: { staticLabels: {} }
          };
          nodesOfCurrentDepthLevel.staticLabels[currentHostNameLabel] = currentStaticLabelNode;
        }

        nodesOfCurrentDepthLevel = currentStaticLabelNode.children;
      }
    }


    return { subdomains: subdomainsNormalizedConfigWorkpiece };
  }

  private static normalizeBasicDomains(rawConfig: Server.RawConfig): Array<string> {

    const isSpecifiedIP_AddressTheLocalhost: boolean = isIPv4AddressLiesInRange({
      comparedIP_Address: rawConfig.IP_Address,
      minimalIP_Address: "127.0.0.1",
      maximalIP_Address: "127.255.255.254"
    });


    if (isUndefined(rawConfig.basicDomains)) {
      return [ ...isSpecifiedIP_AddressTheLocalhost ? [ "localhost" ] : [ ] ];
    }


    if (isSpecifiedIP_AddressTheLocalhost) {

      if (rawConfig.basicDomains.includes("localhost")) {
        Logger.logWarning({
          title: "Redundant explicit domain",
          description: "No need to specify explicitly 'localhost' in 'basicDomains' of raw config - is will be detected " +
              "automatically."
        });
        return [ ...rawConfig.basicDomains ];
      }


      return [ ...rawConfig.basicDomains, "localhost" ];
    }


    return [ ...rawConfig.basicDomains ];
  }


  private static isSubdomainLabelTheParameter(subdomainLabel: string): boolean {
    return subdomainLabel.startsWith(":");
  }

  private static extractDynamicSubdomainLabelName(dynamicSubdomainNotation: string): string {
    return removeAllSpecifiedCharacters(dynamicSubdomainNotation, [ ":", "?" ]);
  }
}
