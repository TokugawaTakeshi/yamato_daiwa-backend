import FileSystem from "fs";

import type Response from "../Response";
import { ServerErrorsHTTP_StatusCodes } from "../UtilsIncubator/HTTP_StatusCodes";
import { Logger, UnexpectedEventError } from "@yamato-daiwa/es-extensions";


export default function sendFileByStreamsAPI(targetFilePath: string, response: Response): void {

  const fileReadingStream: FileSystem.ReadStream = FileSystem.createReadStream(targetFilePath);

  fileReadingStream.pipe(response.toPipeable());

  fileReadingStream.on("error", (fileReadingError: Error): void => {

    Logger.logError({
      errorType: UnexpectedEventError.NAME,
      title: UnexpectedEventError.localization.defaultTitle,
      description: `Failed to submit the file '${ targetFilePath }'.`,
      occurrenceLocation: "sendFileByStreams(targetFilePath, response)",
      caughtError: fileReadingError
    });

    response.submitWithError({
      statusCode: ServerErrorsHTTP_StatusCodes.internalServerError,
      errorMessage: "Internal server error"
    }).
        catch((submittingError: unknown): void => {
          Logger.logError({
            errorType: UnexpectedEventError.NAME,
            title: UnexpectedEventError.localization.defaultTitle,
            description: "Overlapping error.",
            occurrenceLocation: "sendFileByStreams(targetFilePath, response)",
            caughtError: submittingError
          });
        });

  });

  response.addOnConnectionAbortedEventHandler("terminateFileSubmitting", (): void => {
    fileReadingStream.destroy();
  });
}
