import type Request from "../Request";
import type Response from "../Response/Response";
import type Server from "../Server/Server";


type Middleware = (required: Request, response: Response, serverConfig: Server.NormalizedConfig) =>
    Promise<Middleware.CompletionSignal>;


/* eslint-disable-next-line @typescript-eslint/no-redeclare --
* type/interface and namespace merging is supported TypeScript scenario and unwanted to be warned by @typescript-eslint.
* Related issue: https://github.com/typescript-eslint/typescript-eslint/issues/2818 */
namespace Middleware {
  export enum CompletionSignal {
    toNextMiddleware = "TO_NEXT_MIDDLEWARE",
    finishRequestHandling = "FINISH_RESPONSE_HANDLING"
  }
}


export default Middleware;
