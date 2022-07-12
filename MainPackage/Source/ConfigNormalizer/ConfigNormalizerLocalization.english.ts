import type ConfigNormalizerLocalization from "./ConfigNormalizerLocalization";


const ConfigNormalizerLocalization__English: ConfigNormalizerLocalization = {
  neitherHTTP_NotHTTPS_SettingsHasBeenSpecifiedError: "Neither HTTP nor HTTPS settings has been specified. Nothing to server.",
  redundantExplicitLocalhostWarning: {
    title: "Redundant explicit 'localhost'",
    description: "No need to specify explicitly 'localhost' in 'basicDomains' of raw config - is will be detected " +
        "automatically."
  }
};


export default ConfigNormalizerLocalization__English;
