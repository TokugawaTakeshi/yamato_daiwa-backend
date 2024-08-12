import type Server from "../Server/Server";

import type HTTP from "http";
import FileSystem from "fs";

import {
  Logger,
  UnexpectedEventError,
  SuccessfulResponsesHTTP_StatusCodes,
  isNotUndefined
} from "@yamato-daiwa/es-extensions";
import type {
  ParsedJSON,
  ClientErrorsHTTP_StatusCodes,
  ServerErrorsHTTP_StatusCodes
} from "@yamato-daiwa/es-extensions";

import { ResponseLocalizer } from "./ResponseLocalization";


class Response {

  private readonly rawResponse: HTTP.ServerResponse;


  public constructor(rawResponse: HTTP.ServerResponse, configuration: Server.NormalizedConfiguration) {

    this.rawResponse = rawResponse;

    this.rawResponse.
        setHeader("Cross-Origin-Opener-Policy", configuration.security.HTTP_Headers.crossOriginOpenerPolicy).
        setHeader("Cross-Origin-Resource-Policy", configuration.security.HTTP_Headers.crossOriginResourcePolicy);

    if (configuration.security.HTTP_Headers.originAgentCluster) {
      this.rawResponse.setHeader("Origin-Agent-Cluster", "?1");
    }

  }


  public async submitWithSuccess(payload: Response.SuccessfulSubmittingPayload): Promise<void> {

    this.rawResponse.statusCode = payload.statusCode ?? SuccessfulResponsesHTTP_StatusCodes.OK;

    if ("HTML_Content" in payload) {
      this.rawResponse.setHeader("Content-Type", "text/html");
      this.rawResponse.write(payload.HTML_Content);
    } else if ("JSON_Content" in payload) {
      this.rawResponse.setHeader("Content-Type", "application/json");
      this.rawResponse.write(JSON.stringify(payload.JSON_Content));
    } else if ("plainTextContent" in payload) {
      this.rawResponse.setHeader("Content-Type", "text/plain");
      this.rawResponse.write(payload.plainTextContent);
    } else if ("filePath" in payload) {
      return this.sendFileByStreamAPI(payload.filePath);
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

    if (isNotUndefined(payload.errorMessage)) {
      this.rawResponse.statusMessage = payload.errorMessage;
    }

    if (isNotUndefined(payload.HTML_Content)) {
      this.rawResponse.setHeader("Content-Type", "text/html");
      this.rawResponse.write(payload.HTML_Content);
    } else if (isNotUndefined(payload.JSON_Content)) {
      this.rawResponse.setHeader("Content-Type", "application/json");
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


  private async sendFileByStreamAPI(targetFilePath: string): Promise<void> {
    return new Promise<void>((resolve: () => void, reject: (error: Error) => void): void => {

      const fileReadingStream: FileSystem.ReadStream = FileSystem.createReadStream(targetFilePath);

      fileReadingStream.pipe(this.rawResponse);

      fileReadingStream.on("error", (fileReadingError: Error): void => {

        Logger.logError({
          errorType: UnexpectedEventError.NAME,
          ...ResponseLocalizer.localization.generateFileSubmittingFailureErrorLog({ targetFilePath }),
          occurrenceLocation: "response.sendFileByStreamAPI(targetFilePath)",
          caughtError: fileReadingError
        });

        reject(fileReadingError);

      });


      /* [ Theory ] For the file reading stream 'close' event fires on normal completion.
       * If we will not utilize the 'fileReadingStream', memory leak will occur. */
      fileReadingStream.on("close", resolve);

      /* [ Theory ] For the response, the writable stream, 'close' event fires when client aborted the connection.
      * If we will not utilize the 'fileReadingStream', memory leak will occur. */
      this.rawResponse.on("close", (): void => {
        fileReadingStream.destroy();
        resolve();
      });

    });
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
          { plainTextContent: string; } |
          { filePath: string; }
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
}


export default Response;
