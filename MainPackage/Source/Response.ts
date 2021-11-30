import type HTTP from "http";

import type { ParsedJSON } from "@yamato-daiwa/es-extensions";
import { isNotUndefined } from "@yamato-daiwa/es-extensions";
import type {
  ClientErrorsHTTP_StatusCodes,
  ServerErrorsHTTP_StatusCodes
} from "./UtilsIncubator/HTTP_StatusCodes";
import {
  SuccessfulResponsesHTTP_StatusCodes
} from "./UtilsIncubator/HTTP_StatusCodes";


class Response {

  private readonly rawResponse: HTTP.ServerResponse;
  private readonly onConnectionAbortedEventHandlers: Response.EventHandlers = {};


  public constructor(rawResponse: HTTP.ServerResponse) {

    this.rawResponse = rawResponse;

    this.rawResponse.on("close", (): void => {
      for (const onConnectionAbortedEventHandler of Object.values(this.onConnectionAbortedEventHandlers)) {
        onConnectionAbortedEventHandler();
      }
    });
  }


  public async submitWithSuccess(payload: Response.SuccessfulSubmittingPayload): Promise<void> {

    this.rawResponse.statusCode = payload.statusCode ?? SuccessfulResponsesHTTP_StatusCodes.OK;

    if ("HTML_Content" in payload) {
      this.rawResponse.setHeader("Content-Type", "text/html");
      this.rawResponse.write(payload.HTML_Content);
    } else if ("JSON_Content" in payload) {
      this.rawResponse.setHeader("Content-Type", "text/json");
      this.rawResponse.write(JSON.stringify(payload.JSON_Content));
    } else if ("plainTextContent" in payload) {
      this.rawResponse.setHeader("Content-Type", "text/plain");
      this.rawResponse.write(payload.plainTextContent);
    }

    if (payload.noCache === true) {
      this.rawResponse.setHeader("Cache-control", "no-cache");
    }

    return new Promise<void>((resolve: () => void): void => {
      this.rawResponse.end(resolve);
    });
  }

  public async submitWithError(payload: Response.ErroredSubmittingPayload): Promise<void> {

    this.rawResponse.statusCode = payload.statusCode;

    this.rawResponse.writeHead(payload.statusCode, payload.errorMessage);

    if (isNotUndefined(payload.HTML_Content)) {
      this.rawResponse.setHeader("Content-Type", "text/html");
      this.rawResponse.write(payload.HTML_Content);
    } else if (isNotUndefined(payload.JSON_Content)) {
      this.rawResponse.setHeader("Content-Type", "text/json");
      this.rawResponse.write(JSON.stringify(payload.JSON_Content));
    } else if (isNotUndefined(payload.plainTextContent)) {
      this.rawResponse.setHeader("Content-Type", "text/plain");
      this.rawResponse.write(payload.plainTextContent);
    }

    return new Promise<void>((resolve: () => void): void => {
      this.rawResponse.end(resolve);
    });
  }

  public setHeaders(headers: { [headerName: string]: string; }): void {
    for (const [ key, value ] of Object.entries(headers)) {
      this.rawResponse.setHeader(key, value);
    }
  }

  public addOnConnectionAbortedEventHandler(name: string, handler: () => unknown): void {
    this.onConnectionAbortedEventHandlers[name] = handler;
  }

  /* [ Theory ] It's better to don't make possible to remove all handlers because the engineer
  *     could not embrace which handler has been added. */
  public removeOnConnectionAbortedEventHandlers(
    targetHandlerNameOrMultipleNames: string | Array<string>
  ): void {

    const targetHandlersNames: Array<string> = Array.isArray(targetHandlerNameOrMultipleNames) ?
        targetHandlerNameOrMultipleNames : [ targetHandlerNameOrMultipleNames ];

    for (const handlerName of targetHandlersNames) {
      /* eslint-disable-next-line @typescript-eslint/no-dynamic-delete --
      * Removing of the handler from pseudo-map is completely normal scenario. */
      delete this.onConnectionAbortedEventHandlers[handlerName];
    }
  }

  public toPipeable(): NodeJS.WritableStream {
    return this.rawResponse;
  }
}


namespace Response {

  export type SuccessfulSubmittingPayload =
      Readonly<
        {
          statusCode?: SuccessfulResponsesHTTP_StatusCodes;
          noCache?: boolean;
        } &
        (
          { JSON_Content: ParsedJSON; } |
          { HTML_Content: string; } |
          { plainTextContent: string; }
        )
      >;

  export type ErroredSubmittingPayload =
      Readonly<{
        statusCode: ClientErrorsHTTP_StatusCodes | ServerErrorsHTTP_StatusCodes;
        errorMessage?: string;
        JSON_Content?: ParsedJSON;
        HTML_Content?: string;
        plainTextContent?: string;
      }>;

  export type EventHandlers = { [handlerName: string]: () => unknown; };
}


export default Response;
