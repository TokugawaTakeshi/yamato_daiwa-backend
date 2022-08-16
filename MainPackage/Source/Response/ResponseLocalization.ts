import type { ErrorLog } from "@yamato-daiwa/es-extensions";
import responseLocalization__english from "./ResponseLocalization.english";


type ResponseLocalization = Readonly<{

  generateFileSubmittingFailureErrorLog:
      (namedParameters: ResponseLocalization.FileSubmittingFailureErrorLog.NamedParameters) =>
          ResponseLocalization.FileSubmittingFailureErrorLog;

}>;

/* eslint-disable-next-line @typescript-eslint/no-redeclare --
 * type/interface and namespace merging is supported TypeScript scenario and unwanted to be warned by @typescript-eslint.
 * Related issue: https://github.com/typescript-eslint/typescript-eslint/issues/2818 */
namespace ResponseLocalization {

  export type FileSubmittingFailureErrorLog = Pick<ErrorLog, "title" | "description">;

  export namespace FileSubmittingFailureErrorLog {
    export type NamedParameters = Readonly<{ targetFilePath: string; }>;
  }

}


export class ResponseLocalizer {
  public static localization: ResponseLocalization = responseLocalization__english;
}


export default ResponseLocalization;
