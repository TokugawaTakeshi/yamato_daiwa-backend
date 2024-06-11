/* ─── Framework's Constituents ───────────────────────────────────────────────────────────────────────────────────── */
import type Server from "../Server/Server";
import Router from "../Router";

/* ─── Fundamentals ───────────────────────────────────────────────────────────────────────────────────────────────── */
import { NETWORK_PORT_MINIMAL_VALUE, NETWORK_PORT_MAXIMAL_VALUE } from "fundamental-constants";

/* ─── Default Conventions ────────────────────────────────────────────────────────────────────────────────────────── */
import URI_QueryParametersDefaultSerializer from "../DefaultConventions/URI_QueryParametersDefaultSerializer";

/* ─── General Utils ──────────────────────────────────────────────────────────────────────────────────────────────── */
import Path from "path";
import FileSystem from "fs";
import {
  Logger,
  InvalidConfigError,
  isIPv4AddressLiesInRange,
  splitString,
  isUndefined,
  removeAllSpecifiedCharacters,
  isNotUndefined,
  type WarningLog, isNaturalNumber
} from "@yamato-daiwa/es-extensions";

/* ─── Localization ───────────────────────────────────────────────────────────────────────────────────────────────── */
import configurationNormalizerLocalization__english from "./ConfigurationNormalizerLocalization.english";


class ConfigurationNormalizer {

  public static localization: ConfigurationNormalizer.Localization = configurationNormalizerLocalization__english;

  public static normalize(rawConfiguration: Server.RawConfiguration): Server.NormalizedConfiguration {

    if (isUndefined(rawConfiguration.HTTP) && isUndefined(rawConfiguration.HTTPS)) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidConfigError({
          customMessage: ConfigurationNormalizer.localization.errorsMessages.neitherHTTP_NotHTTPS_SettingsHasBeenSpecified
        }),
        title: InvalidConfigError.localization.defaultTitle,
        occurrenceLocation: "ConfigurationNormalizer.normalize(rawConfiguration)"
      });
    }

    return {

      IP_Address: rawConfiguration.IP_Address,

      ...ConfigurationNormalizer.normalizeHTTP_Configuration(rawConfiguration),
      ...ConfigurationNormalizer.normalizeHTTPS_Configuration(rawConfiguration),

      routing: Router.normalizeRouting(rawConfiguration.routing ?? []),

      publicDirectoriesAbsolutePaths: ConfigurationNormalizer.
          computePublicDirectoriesAbsolutePaths(rawConfiguration.publicDirectoriesAbsoluteOrRelativePaths),

      security: ConfigurationNormalizer.normalizeSecurityConfiguration(rawConfiguration),

      ...ConfigurationNormalizer.normalizeSubdomainsConfig(rawConfiguration),

      /* [ Theory ] We need to check does each specified domain matching with IP_Address, what is the asynchronous processing
      *     intended to be executed during server starting. Currently, there are asynchronous processings are not allowed in
      *     config normalizer to not make the Server's constructor asynchronous. */
      basicDomains: ConfigurationNormalizer.normalizeBasicDomains(rawConfiguration),

      URI_QueryParametersMainDeserializer:
          rawConfiguration.URI_QueryParametersMainDeserializer ??
          URI_QueryParametersDefaultSerializer

    };

  }


  private static normalizeHTTP_Configuration(
    rawConfiguration: Server.RawConfiguration
  ): { HTTP: Server.NormalizedConfiguration.HTTP; } | null {

    if (isUndefined(rawConfiguration.HTTP)) {
      return null;
    }


    const port: number = ConfigurationNormalizer.validatePort(rawConfiguration.HTTP.port);

    return {
      HTTP: {
        IP_AddressBasedMainOrigin: `http://${ rawConfiguration.IP_Address }:${ port }`,
        port
      }
    };

  }

  private static normalizeHTTPS_Configuration(
    rawConfiguration: Server.RawConfiguration
  ): { HTTPS: Server.NormalizedConfiguration.HTTPS; } | null {

    if (isUndefined(rawConfiguration.HTTPS)) {
      return null;
    }


    const port: number = ConfigurationNormalizer.validatePort(rawConfiguration.HTTPS.port);

    return {
      HTTPS: {
        IP_AddressBasedMainOrigin: `https://${ rawConfiguration.IP_Address }:${ port }`,
        port,
        SSL_Key: "SSL_Key" in rawConfiguration.HTTPS ?
            rawConfiguration.HTTPS.SSL_Key :
            FileSystem.readFileSync(
              Path.isAbsolute(rawConfiguration.HTTPS.SSL_KeyFileRelativeOrAbsolutePath) ?
                  rawConfiguration.HTTPS.SSL_KeyFileRelativeOrAbsolutePath :
                  Path.resolve(process.cwd(), rawConfiguration.HTTPS.SSL_KeyFileRelativeOrAbsolutePath),
              "utf-8"
            ),
        SSL_Certificate: "SSL_Certificate" in rawConfiguration.HTTPS ?
            rawConfiguration.HTTPS.SSL_Certificate :
            FileSystem.readFileSync(
              Path.isAbsolute(rawConfiguration.HTTPS.SSL_CertificateFileRelativeOrAbsolutePath) ?
                  rawConfiguration.HTTPS.SSL_CertificateFileRelativeOrAbsolutePath :
                  Path.resolve(process.cwd(), rawConfiguration.HTTPS.SSL_CertificateFileRelativeOrAbsolutePath),
              "utf-8"
            )
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

  private static normalizeSecurityConfiguration(rawConfiguration: Server.RawConfiguration): Server.Security {

    return {

      HTTP_Headers: {

        /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy */
        crossOriginOpenerPolicy: rawConfiguration.security?.HTTP_Headers?.crossOriginOpenerPolicy ?? "same-origin",

        /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy */
        crossOriginResourcePolicy: rawConfiguration.security?.HTTP_Headers?.crossOriginResourcePolicy ?? "same-origin",

        /** @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin-Agent-Cluster */
        originAgentCluster: rawConfiguration.security?.HTTP_Headers?.originAgentCluster !== false

      }
    };

  }

  private static normalizeSubdomainsConfig(
    rawConfig: Server.RawConfiguration
  ): { subdomains: Server.NormalizedConfiguration.Subdomains; } | null {

    if (isUndefined(rawConfig.subdomains) || Object.entries(rawConfig.subdomains).length === 0) {
      return null;
    }


    const subdomainsNormalizedConfigWorkpiece: Server.NormalizedConfiguration.Subdomains = { staticLabels: {} };
    let nodesOfCurrentDepthLevel: Server.NormalizedConfiguration.Subdomains.TreeNodes = subdomainsNormalizedConfigWorkpiece;

    for (const [ subdomainPattern, subdomainRawConfig ] of Object.entries(rawConfig.subdomains)) {

      const subdomainPatternExplodedToLabels: Array<string> = splitString(subdomainPattern, ".").reverse();
      const labelsCountInSubdomainPattern: number = subdomainPatternExplodedToLabels.length;

      for (const [ index, currentHostNameLabel ] of subdomainPatternExplodedToLabels.entries()) {

        const labelNumber__numerationFrom1: number = index + 1;
        const isLastLabel: boolean = labelNumber__numerationFrom1 === labelsCountInSubdomainPattern;

        // Console.log(`--- ${labelNumber__numerationFrom1} : ${currentHostNameLabel} ------------------------------- `);

        if (isLastLabel) {

          /* eslint-disable-next-line max-depth --
          * In this case, the extraction in other method will be singular and brake the uniform narration. */
          if (ConfigurationNormalizer.isSubdomainLabelTheParameter(currentHostNameLabel)) {

            nodesOfCurrentDepthLevel.dynamicLabel = {
              match: {
                routing: Router.normalizeRouting(subdomainRawConfig.routing),
                publicDirectoriesAbsolutePaths: ConfigurationNormalizer.
                    computePublicDirectoriesAbsolutePaths(subdomainRawConfig.publicDirectoriesAbsoluteOrRelativePaths)
              },
              name: ConfigurationNormalizer.extractDynamicSubdomainLabelName(currentHostNameLabel),
              children: { staticLabels: {} }
            };

            break;
          }


          nodesOfCurrentDepthLevel.staticLabels[currentHostNameLabel] = {
            match: {
              routing: Router.normalizeRouting(subdomainRawConfig.routing),
              publicDirectoriesAbsolutePaths: ConfigurationNormalizer.
                  computePublicDirectoriesAbsolutePaths(subdomainRawConfig.publicDirectoriesAbsoluteOrRelativePaths)
            },
            children: { staticLabels: {} }
          };

          break;
        }


        const staticLabelNodeOfCurrentDepthLevel: Server.NormalizedConfiguration.Subdomains.StaticLabelNode | undefined =
            nodesOfCurrentDepthLevel.staticLabels[currentHostNameLabel];

        /* [ Mnemonic ] Create platform -> mount platform -> climb to platform */
        let currentStaticLabelNode: Server.NormalizedConfiguration.Subdomains.StaticLabelNode;

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

  private static normalizeBasicDomains(rawConfig: Server.RawConfiguration): Array<string> {

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
        Logger.logWarning(ConfigurationNormalizer.localization.redundantExplicitLocalhostWarning);
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

  private static validatePort(specifiedPort: number): number {

    if (!isNaturalNumber(specifiedPort)) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidConfigError({
          mentionToConfig: "Server.RawConfiguration",
          messageSpecificPart: ConfigurationNormalizer.localization.errorsMessages.invalidPortNumbersSet.
              generate({ specifiedPort })
        }),
        title: InvalidConfigError.localization.defaultTitle,
        occurrenceLocation: "ConfigurationNormalizer.validatePort(specifiedPort)"
      });
    }


    if (specifiedPort < NETWORK_PORT_MINIMAL_VALUE || specifiedPort > NETWORK_PORT_MAXIMAL_VALUE) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidConfigError({
          mentionToConfig: "Server.RawConfiguration",
          messageSpecificPart: ConfigurationNormalizer.localization.errorsMessages.portOutOfRange.generate({
            minimalPort: NETWORK_PORT_MINIMAL_VALUE,
            maximalPort: NETWORK_PORT_MAXIMAL_VALUE,
            specifiedPort
          })
        }),
        title: InvalidConfigError.localization.defaultTitle,
        occurrenceLocation: "ConfigurationNormalizer.validatePort(specifiedPort)"
      });
    }


    return specifiedPort;

  }

}


namespace ConfigurationNormalizer {

  export type Localization = Readonly<{
    errorsMessages: Readonly<{
      neitherHTTP_NotHTTPS_SettingsHasBeenSpecified: string;
      invalidPortNumbersSet: Readonly<{
        generate: (templateVariables: Localization.ErrorsMessages.InvalidPortNumbersSet.TemplateVariables) => string;
      }>;
      portOutOfRange: Readonly<{
        generate: (templateVariables: Localization.ErrorsMessages.PortOutOfRange.TemplateVariables) => string;
      }>;
    }>;
    redundantExplicitLocalhostWarning: Readonly<Pick<WarningLog, "title" | "description">>;
  }>;

  export namespace Localization {

    export namespace ErrorsMessages {

      export namespace InvalidPortNumbersSet {
        export type TemplateVariables = Readonly<{ specifiedPort: number; }>;
      }

      export namespace PortOutOfRange {
        export type TemplateVariables = Readonly<{
          specifiedPort: number;
          minimalPort: number;
          maximalPort: number;
        }>;
      }

    }

  }

}


export default ConfigurationNormalizer;
