import HTTP from "http";

import Response from "./Response";


export default class HTTP_Response extends Response {

  private readonly rawResponse: HTTP.ServerResponse;


  public constructor(rawResponse: HTTP.ServerResponse) {
    super();
    this.rawResponse = rawResponse;
  }


  public async submit(payload: Response.Payload): Promise<void> {

    this.rawResponse.statusCode = payload.statusCode;

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


  public setHeaders(headers: Array<[string, string]>): void {
    for (const [ key, value ] of headers) {
      this.rawResponse.setHeader(key, value);
    }
  }
}
