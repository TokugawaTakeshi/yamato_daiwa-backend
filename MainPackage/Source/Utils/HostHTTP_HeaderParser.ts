import {
  isUndefined,
  isNotUndefined,
  removeLastCharacter,
  removeNthCharacter,
  splitString,
  isNonEmptyArray,
  hasStringOnlySpecificCharacters
} from "@yamato-daiwa/es-extensions";


class HostHTTP_HeaderParser {

  public static parse(
    rawHTTP_HostHeader: string, options: {
      defaultPortForActualProtocol: number;
      supportedBasicDomains?: ReadonlyArray<string>;
    }
  ): HostHTTP_HeaderParser.ParsedHostHTTP_Header {

    let workpiece: string = rawHTTP_HostHeader;

    let hasHostHeaderAtLeastOneColon: boolean = false;

    /* [ Theory ] Truthy value means IPv6 format. */
    const hasHostHeaderMultipleColons: boolean = ((): boolean => {

      /* [ Approach ] Searching from the end buying a bit of performance, because there could be optional port delimited
       *  by colon. */
      for (const character of splitString(workpiece, "").reverse()) {

        if (character === ":") {

          if (hasHostHeaderAtLeastOneColon) {
            return true;
          }

          hasHostHeaderAtLeastOneColon = true;
        }
      }

      return false;

    })();


    /* [ Theory ] If IPv6 address has explicit port, square brackets are required. */
    const isIPv6AddressWithOmittedPort: boolean = hasHostHeaderMultipleColons && !workpiece.includes("[");
    let port: number;

    if (isIPv6AddressWithOmittedPort) {
      port = options.defaultPortForActualProtocol;
    } else {

      const regularExpressionSearchResults: RegExpExecArray | null = (/:(?<port>\d+)$/u).exec(workpiece);
      const extractedPort: string | undefined = regularExpressionSearchResults?.groups?.port;

      if (isNotUndefined(extractedPort)) {
        port = Number(extractedPort);
        workpiece = workpiece.replace(/:\d+$/u, "");
      } else {
        port = options.defaultPortForActualProtocol;
      }
    }


    /* [ Theory ] Top level domain (TLD) could not consist from digits only, thus, pattern like "subdomain.<IP_ADDRESS>"
     * are invalid.  */
    let IP_Address: string | undefined;

    if (hasStringOnlySpecificCharacters(workpiece, {
      digits: true,
      other: [ "." ]
    })) {
      IP_Address = workpiece;
    } else if (workpiece.startsWith("[") && workpiece.endsWith("]")) {
      workpiece = removeNthCharacter(workpiece, { targetCharacterNumber: 1, numerationFrom: 1 });
      IP_Address = removeLastCharacter(workpiece);
    }

    if (isNotUndefined(IP_Address)) {
      return {
        port,
        IP_Address
      };
    }


    const domain: string = workpiece;
    const domainExplodedToLabels__fromTopLevelDomain: Array<string> = splitString(domain, ".").reverse();

    if (!isNonEmptyArray(options.supportedBasicDomains) || options.supportedBasicDomains.includes(domain)) {
      return {
        port,
        domain,
        domainExplodedToLabels__fromTopLevelDomain,
        subdomainsOfMainDomain: {
          fromLowermostLevel: [],
          fromTopmostLevel: []
        }
      };
    }


    let matchingBasicDomain: string | undefined;

    for (const basicDomain of options.supportedBasicDomains) {
      if (domain.endsWith(basicDomain)) {
        matchingBasicDomain = basicDomain;
        break;
      }
    }

    if (isUndefined(matchingBasicDomain)) {
      return {
        port,
        domain,
        domainExplodedToLabels__fromTopLevelDomain,
        subdomainsOfMainDomain: {
          fromLowermostLevel: [],
          fromTopmostLevel: []
        }
      };
    }

    const matchingBasicDomainExplodedToLabels__fromTopLevelDomain: Array<string> =
        splitString(matchingBasicDomain, ".").reverse();
    const subdomainsOfMainDomain__fromLowermostLevel: Array<string> = [];

    for (const [ index, label ] of domainExplodedToLabels__fromTopLevelDomain.entries()) {
      if (isUndefined(matchingBasicDomainExplodedToLabels__fromTopLevelDomain[index])) {
        subdomainsOfMainDomain__fromLowermostLevel.unshift(label);
      }
    }


    return {
      port,
      domain,
      domainExplodedToLabels__fromTopLevelDomain,
      subdomainsOfMainDomain: {
        fromLowermostLevel: subdomainsOfMainDomain__fromLowermostLevel,
        fromTopmostLevel: subdomainsOfMainDomain__fromLowermostLevel.reverse()
      }
    };
  }
}


namespace HostHTTP_HeaderParser {
  export type ParsedHostHTTP_Header = {
    port: number;
  } & (
    {
      IP_Address: string;
    } | {
      domain: string;
      domainExplodedToLabels__fromTopLevelDomain: Array<string>;
      subdomainsOfMainDomain: {
        fromLowermostLevel: Array<string>;
        fromTopmostLevel: Array<string>;
      };
    }
  );
}


export default HostHTTP_HeaderParser;
