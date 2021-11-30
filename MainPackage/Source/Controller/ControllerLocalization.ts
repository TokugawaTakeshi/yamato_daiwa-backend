import ControllerLocalization__English from "./ControllerLocalization.english";


type ControllerLocalization = {
  readonly errors: {
    readonly invalidTargetForRouteHandlerDecorator: string;
  };
};


export class ControllerLocalizer {
  public static readonly localization: ControllerLocalization = ControllerLocalization__English;
}


export default ControllerLocalization;
