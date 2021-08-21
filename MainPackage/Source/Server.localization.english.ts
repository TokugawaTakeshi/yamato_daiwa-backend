import Server from "./Server";
import Localization = Server.Localization;

import { SuccessLog } from "@yamato-daiwa/es-extensions";


const ServerLocalization__English: Server.Localization = {

  successMessages: {

    HTTP_RequestsServiceStarted: (parameters: Localization.HTTP_RequestsServiceStartedMessageParameters): SuccessLog => ({
      title: "The serving of HTTP requests started",
      description: "Waiting for the HTTP requests on:\n" +
          `  host: ${parameters.host}\n` +
          `  port: ${parameters.HTTP_Port}`
    }),

    HTTPS_RequestsServiceStarted: (parameters: Localization.HTTPS_RequestsServiceStartedMessageParameters): SuccessLog => ({
      title: "The serving of HTTPS requests started",
      description: "Waiting for the HTTPS requests on:\n" +
          `  host: ${parameters.host}\n` +
          `  port: ${parameters.HTTPS_Port}`
    })
  }
};


export default ServerLocalization__English;
