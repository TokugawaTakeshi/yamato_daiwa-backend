import Middleware from "./Middleware";
import { Request } from "../Request";
import Response from "../Response/Response";
// import Server from "../Server";


const CORS_Middleware: Middleware = async (
    _request: Request, response: Response //_serverConfig: Server.Config
): Promise<Middleware.CompletionSignal> => new Promise<Middleware.CompletionSignal>(
    (resolve: (completionSignal: Middleware.CompletionSignal) => void): void => {

    /*
     * https://stackoverflow.com/questions/66528923/retrieving-of-domain-host-and-port-of-incomingmessage-in-http-module-of-nodej
     * */
    response.setHeaders([
      [ "Access-Control-Allow-Origin", "*" ]
    ]);

    resolve(Middleware.CompletionSignal.toNextMiddleware);
  }
);


export default CORS_Middleware;
