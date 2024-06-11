import { isNonEmptyString, splitString } from "@yamato-daiwa/es-extensions";


export default function parseCookieHTTP_Header(cookieHTTP_Header: string): Map<string, string> {

  if (cookieHTTP_Header.length === 0) {
    return new Map<string, string>();
  }


  const parsedCookies: Map<string, string> = new Map<string, string>();

  for (const stringifiedCookie of splitString(cookieHTTP_Header, ";")) {

    const [ cookieName, cookieValue ]: Array<string | undefined> = splitString(stringifiedCookie, "=");

    if (!(isNonEmptyString(cookieName) && isNonEmptyString(cookieValue))) {
      continue;
    }


    parsedCookies.set(decodeURIComponent(cookieName.trim()), decodeURIComponent(cookieValue.trim()));

  }

  return parsedCookies;

}
