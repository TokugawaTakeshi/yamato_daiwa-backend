import { HTTP_Methods, type InheritEnumerationKeys } from "@yamato-daiwa/es-extensions";


namespace Routing {

  export namespace Pages {

    export namespace Top {
      export const HTTP_METHOD: HTTP_Methods = HTTP_Methods.get;
      export const URI_PATH: string = "/";
    }

    export namespace Product {

      export namespace List {
        export const HTTP_METHOD: HTTP_Methods = HTTP_Methods.get;
        export const URI_PATH: string = "products";
      }

      export namespace Details {

        export const HTTP_METHOD: HTTP_Methods = HTTP_Methods.get;

        export enum URI_PathParametersValues {
          productID = "ID"
        }

        export type URI_PathParameters = Readonly<InheritEnumerationKeys<typeof URI_PathParametersValues, string>>;

        function getURI_PathWorkpiece({ productID }: URI_PathParameters): string {
          return `/api/fragments/member_editor/${ productID }`;
        }

        export const URI_PathTemplate: string = getURI_PathWorkpiece({ productID: `:${ URI_PathParametersValues.productID }` });

        export function buildURN_Path(pathParameter: URI_PathParameters): string {
          return getURI_PathWorkpiece(pathParameter);
        }

      }

    }

  }

}


export default Routing;
