/* eslint-disable max-classes-per-file --
* This limitation is unsolicited for the namespaced classes, however there is no ESLint option allowing this case. */
import { Logger, UnexpectedEventError } from "@yamato-daiwa/es-extensions";


class RegularExpressionCapturingGroupsMatcher {

  public static findSingleMatching(
    targetString: string, regularExpression: RegExp
  ): RegularExpressionCapturingGroupsMatcher.Matching {
    return new RegularExpressionCapturingGroupsMatcher.Matching(targetString.match(regularExpression)?.groups);
  }

  public static findAllMatchings(
    targetString: string, regularExpression: RegExp
  ): Array<RegularExpressionCapturingGroupsMatcher.Matching> {
    return Array.from(targetString.matchAll(regularExpression)).
        map(
          (match: RegExpMatchArray): RegularExpressionCapturingGroupsMatcher.Matching =>
              new RegularExpressionCapturingGroupsMatcher.Matching(match.groups)
        );
  }
}


namespace RegularExpressionCapturingGroupsMatcher {

  export class Matching {

    public readonly capturingGroups: { readonly [groupName: string]: string; };

    public constructor(capturingGroups?: { readonly [groupName: string]: string; }) {
      this.capturingGroups = capturingGroups ?? {};
    }

    public getExpectedToBeExistingMatchingWithCapturingGroup(groupName: string): string {

      if (typeof this.capturingGroups[groupName] === "undefined") {
        Logger.throwErrorAndLog({
          errorInstance: new UnexpectedEventError(
            `Contrary to expectations, there is no matching with named capturing group '${ groupName }'.`
          ),
          title: UnexpectedEventError.localization.defaultTitle,
          occurrenceLocation: "RegularExpressionCapturingGroupsMatcher.Matching." +
              "getExpectedToBeExistingMatchingWithCapturingGroup(groupName)"
        });
      }


      return this.capturingGroups[groupName];
    }
  }
}


export default RegularExpressionCapturingGroupsMatcher;
