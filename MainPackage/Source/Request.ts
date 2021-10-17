import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


type Request = {
  URL: URL;
  HTTP_Method: HTTP_Methods;
  subdomainParameters: Request.SubdomainParameters;
};


namespace Request {
  export type SubdomainParameters = { [parameterName: string]: string | undefined; };
}


export default Request;
