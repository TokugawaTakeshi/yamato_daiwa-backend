import Path from "path";
import FileSystem from "fs";

import Handlebars from "handlebars";
import Pug from "pug";

import type { ParsedJSON_Object } from "@yamato-daiwa/es-extensions";
import { Logger, UnsupportedScenarioError } from "@yamato-daiwa/es-extensions";


class TemplateEngine {

  public static cacheRenderer<Data extends ParsedJSON_Object>(templateFilePath: string): TemplateEngine.CachedRenderer<Data> {

    let templateFileAbsolutePath: string;

    if (Path.isAbsolute(templateFilePath)) {
      templateFileAbsolutePath = templateFilePath;
    } else {
      templateFileAbsolutePath = Path.join(process.cwd(), templateFilePath);
    }

    const templateContents: string = FileSystem.readFileSync(templateFileAbsolutePath, "utf-8");

    switch (Path.parse(templateFileAbsolutePath).ext) {

      case ".hbs":
      case ".handlebars": {
        return Handlebars.compile(templateContents);
      }

      case ".pug": {
        return Pug.compile(templateContents);
      }

      case "": {

        Logger.throwErrorAndLog({
          errorInstance: new UnsupportedScenarioError(
            `The path to template file '${ templateFilePath }' does not including the filename extension while ` +
            "automatic detecting of filename extension is not supported."
          ),
          title: UnsupportedScenarioError.localization.defaultTitle,
          occurrenceLocation: "TemplateEngine.cacheRenderer(templateFilePath)"
        });
      }

      /* eslint-disable-next-line no-fallthrough --
      * ESLint does not detect that 'throwErrorAndLog' returns 'never' type. */
      default: {
        Logger.throwErrorAndLog({
          errorInstance: new UnsupportedScenarioError(
            `The template file '${ templateFilePath }' has unsupported filename extension.`
          ),
          title: UnsupportedScenarioError.localization.defaultTitle,
          occurrenceLocation: "TemplateEngine.cacheRenderer(templateFilePath)"
        });
      }
    }
  }
}


namespace TemplateEngine {
  /* eslint-disable-next-line id-denylist --
  * 'templateData' is incorrect rather than just 'data' because 'template' and 'data' are two elements of template engine
  * conception. */
  export type CachedRenderer<Data extends ParsedJSON_Object> = (data: Data) => string;
}


export default TemplateEngine;
