export default function isIPv4AddressLiesInRange(
  namedParameters: {
    comparedIP_Address: string;
    minimalIP_Address: string;
    maximalIP_Address: string;
  }
): boolean {

  function IPv4AddressToNumber(IPv4Address: string): number {

    const CHARACTERS_COUNT_WHICH_WILL_BE_REMOVED_FROM_THE_START_OF_IP_ADDRESS_OCTET: number = 3;

    return Number(
      IPv4Address.split(".").
          map(
            (stringifiedDigits: string): string => `000${ stringifiedDigits }`.
                substring(CHARACTERS_COUNT_WHICH_WILL_BE_REMOVED_FROM_THE_START_OF_IP_ADDRESS_OCTET)
          ).
          join("")
    );
  }

  return IPv4AddressToNumber(namedParameters.comparedIP_Address) >= IPv4AddressToNumber(namedParameters.minimalIP_Address) &&
      IPv4AddressToNumber(namedParameters.comparedIP_Address) <= IPv4AddressToNumber(namedParameters.maximalIP_Address);
}
