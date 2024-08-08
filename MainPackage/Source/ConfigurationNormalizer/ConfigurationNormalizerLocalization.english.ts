import type ConfigurationNormalizer from "./ConfigurationNormalizer";


const configurationNormalizerLocalization__english: ConfigurationNormalizer.Localization = {

  errorsMessages: {

    invalidPortNumbersSet: {
      generate: (
        {
          specifiedPort
        }: ConfigurationNormalizer.Localization.ErrorsMessages.InvalidPortNumbersSet.TemplateVariables
      ): string =>
          `The port must be the natual number while ${ specifiedPort }} has been specified`

    },

    portOutOfRange: {

      generate: (
        {
          specifiedPort,
          minimalPort,
          maximalPort
        }: ConfigurationNormalizer.Localization.ErrorsMessages.PortOutOfRange.TemplateVariables
      ): string =>
          `The port must be within range ${ minimalPort }-${ maximalPort } while ${ specifiedPort } has been specified.`

    },

    neitherHTTP_NotHTTPS_SettingsHasBeenSpecified:
        "Neither HTTP nor HTTPS settings has been specified. Nothing to server."

  },

  redundantExplicitLocalhostWarning: {
    title: "Redundant explicit 'localhost'",
    description: "No need to specify explicitly 'localhost' in 'basicDomains' of raw config - is will be detected " +
        "automatically."
  }

};


export default configurationNormalizerLocalization__english;
