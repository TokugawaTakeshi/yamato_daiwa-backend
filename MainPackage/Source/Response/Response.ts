import { HTTP_StatusCodes, ParsedJSON } from "@yamato-daiwa/es-extensions";


abstract class Response {

  public abstract submit(payload: Response.Payload): Promise<void>;

  public abstract setHeaders(headers: Array<[string, string]>): void;
}


namespace Response {

  export type Payload =
      {
        statusCode: HTTP_StatusCodes;
        noCache?: boolean;
      } &
      (
          { HTML_Content: string; } |
          { JSON_Content: ParsedJSON; } |
          { plainTextContent: string; }
      );
}


export default Response;
