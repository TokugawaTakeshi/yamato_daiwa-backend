import type ResponseLocalization from "./ResponseLocalization";


const responseLocalization__english: ResponseLocalization = {
  generateFileSubmittingFailureErrorLog:
      (namedParameters: ResponseLocalization.FileSubmittingFailureErrorLog.NamedParameters):
          ResponseLocalization.FileSubmittingFailureErrorLog =>
  ({
    title: "File submitting failure",
    description: `The error occurred during submitting of file '${ namedParameters.targetFilePath }'.`
  })

};


export default responseLocalization__english;
