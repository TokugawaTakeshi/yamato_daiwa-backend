class PoliteErrorsMessagesBuilder {

  private static isTechnicalsDetailOnlyMode: boolean = false;

  private static localization: PoliteErrorsMessagesBuilder.Localization =
      PoliteErrorsMessagesBuilder.getDefaultLocalization();


  public static buildMessage(
    namedParameters: Omit<PoliteErrorsMessagesBuilder.ParametersObject, "isTechnicalDetailOnlyMode">
  ): string {
    return PoliteErrorsMessagesBuilder.localization.buildMessage({
      ...namedParameters,
      isTechnicalDetailOnlyMode: PoliteErrorsMessagesBuilder.isTechnicalsDetailOnlyMode
    });
  }

  public static setLocalization(newLocalization: PoliteErrorsMessagesBuilder.Localization): void {
    this.localization = newLocalization;
  }

  public static setTechnicalDetailsOnlyMode(): void {
    PoliteErrorsMessagesBuilder.isTechnicalsDetailOnlyMode = true;
  }


  private static getDefaultLocalization(): PoliteErrorsMessagesBuilder.Localization {
    return {
      buildMessage(
        {
          technicalDetails,
          politeExplanation,
          isTechnicalDetailOnlyMode
        }: {
          technicalDetails: string;
          politeExplanation: string;
          isTechnicalDetailOnlyMode: boolean;
        }
      ): string {

        if (isTechnicalDetailOnlyMode) {
          return technicalDetails;
        }


        return "We are sorry, but it is a bug. We apologize for any inconvenience. 🙇‍♂️\n" +
            "Please consider the opening issue on official GitHub repository: " +
            "https://github.com/TokugawaTakeshi/Yamato-Daiwa-ES-Extensions/issues/new?labels=bug&title=Unexpedted+Event+Report \n\n" +
            "--- What happened? -----------------------------------------------------------------------------------\n" +
            `${ politeExplanation }` +
            "\n\n" +
            "--- Technical information --------------------------------------------------------------------------- \n" +
            `${ technicalDetails }`;
      }
    };
  }
}


namespace PoliteErrorsMessagesBuilder {

  export type ParametersObject = {
    technicalDetails: string;
    politeExplanation: string;
    isTechnicalDetailOnlyMode: boolean;
  };

  export type Localization = {
    buildMessage: (parametersObject: ParametersObject) => string;
  };
}


export default PoliteErrorsMessagesBuilder;
