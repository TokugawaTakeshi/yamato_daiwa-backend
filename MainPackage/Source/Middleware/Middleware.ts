import Request from "../Request";
import Response from "../Response/Response";
import Server from "../Server";


type Middleware = (required: Request, response: Response, serverConfig: Server.NormalizedConfig) =>
    Promise<Middleware.CompletionSignal>;

/* 〔 ESLint muting rationale 〕 Thins merging is TypeScript-valid and intentional. */
/* eslint-disable-next-line @typescript-eslint/no-redeclare */
namespace Middleware {
  export enum CompletionSignal {
    toNextMiddleware = "TO_NEXT_MIDDLEWARE",
    finishRequestHandling = "FINISH_RESPONSE_HANDLING"
  }
}


export default Middleware;
