import QueryString from "qs";
import {
  HTTP_StatusCodes,
  HTTP_Methods,
  Logger,
  DataRetrievingFailedError,
  RawObjectDataProcessor,
  DataSubmittingFailedError,
  InvalidExternalDataError,
  insertSubstringIf,
  isUndefined,
  isNotUndefined,
  removeSpecificCharacterFromCertainPosition,
  isNull
} from "@yamato-daiwa/es-extensions";
import type {
  ParsedJSON,
  ParsedJSON_Object
} from "@yamato-daiwa/es-extensions";


class FetchAPI_Service {

  private static API_ServerURI_ConstantPart: string | null;

  public static setAPI_ServerURI_ConstantPart(API_ServerURI_constantPart: string): void {
    FetchAPI_Service.API_ServerURI_ConstantPart = API_ServerURI_constantPart;
  }

  public static async retrieveData<RawValidResponseData extends ParsedJSON>(
    namedParameters: FetchAPI_Service.DataRetrieving.NamedParameters
  ): Promise<RawValidResponseData> {

    let targetURI: string;
    const {
      HTTP_Headers,
      URI_QueryParameters = {},
      URI_QueryParametersCustomSerializer,
      validResponseDataSpecification
    }: FetchAPI_Service.DataRetrieving.NamedParameters = namedParameters;

    if ("alternatingURI_PathPart" in namedParameters) {

      if (isNull(FetchAPI_Service.API_ServerURI_ConstantPart)) {
        Logger.throwErrorAndLog({
          errorInstance: new DataSubmittingFailedError({
            customMessage: "If 'alternatingURI_PathPart' desired, the constant part of API server URI must be " +
                "set via 'FetchAPI_Service.setAPI_ServerURI_ConstantPart()' while it has not been done."
          }),
          title: DataSubmittingFailedError.localization.defaultTitle,
          occurrenceLocation: "FetchAPI_Service.retrieveData(namedParameters)"
        });
      }

      const API_CONSTANT_URI_PATH_WITHOUT_TRAILING_SLASH: string = FetchAPI_Service.API_ServerURI_ConstantPart;

      /* [ Theory ] About 'encodeURI': https://stackoverflow.com/q/52246044/4818123 */
      targetURI = encodeURI(
        `${ API_CONSTANT_URI_PATH_WITHOUT_TRAILING_SLASH }/` +
        `${ removeSpecificCharacterFromCertainPosition({
          targetString: namedParameters.alternatingURI_PathPart,
          targetCharacter: "/",
          fromFirstPosition: true
        }) }` +
        `${ insertSubstringIf("?", Object.entries(URI_QueryParameters).length > 0) }` +
        `${ isNotUndefined(URI_QueryParametersCustomSerializer) ?
            URI_QueryParametersCustomSerializer(URI_QueryParameters) :
            FetchAPI_Service.serializeQueryParameters(URI_QueryParameters)
        }`
      );
    } else {
      targetURI = encodeURI(namedParameters.specificURI);
    }


    let response: Response;

    try {

      response = await fetch(targetURI, {
        headers: { ...HTTP_Headers ?? {} }
      });

    } catch (error: unknown) {
      Logger.throwErrorAndLog({
        errorInstance: new DataRetrievingFailedError({ customMessage: "サーバとの接続中エラーが発生した。" }),
        title: DataRetrievingFailedError.localization.defaultTitle,
        occurrenceLocation: "FetchAPI_Service.retrieveData(namedParameters)",
        wrappableError: error
      });
    }


    let responseRawData: unknown;

    try {
      responseRawData = await response.json();
    } catch (error: unknown) {
      Logger.throwErrorAndLog({
        errorInstance: new DataRetrievingFailedError({ customMessage: "データ復号中エラー発生。" }),
        title: DataRetrievingFailedError.localization.defaultTitle,
        occurrenceLocation: "FetchAPI_Service.retrieveData(namedParameters)",
        wrappableError: error
      });
    }


    if (!response.ok) {
      Logger.throwErrorAndLog({
        errorInstance: new DataRetrievingFailedError({
          customMessage: `サーバのリスポンスは正常と異なる：\nStatus code: ${ response.status }\nStatus text: ${ response.statusText }`,
          additionalData: responseRawData,
          ...response.status === HTTP_StatusCodes.notFound ? {
            typicalCause: DataRetrievingFailedError.TypicalCauses.notFound
          } : null
        }),
        title: DataRetrievingFailedError.localization.defaultTitle,
        occurrenceLocation: "FetchAPI_Service.retrieveData(namedParameters)",
        additionalData: responseRawData
      });
    }


    const responseRawDataProcessingResult: RawObjectDataProcessor.ProcessingResult<RawValidResponseData> =
        RawObjectDataProcessor.process(responseRawData, validResponseDataSpecification);

    if (responseRawDataProcessingResult.rawDataIsInvalid) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidExternalDataError({
          mentionToExpectedData: "リスポンスデータ",
          messageSpecificPart: RawObjectDataProcessor.formatValidationErrorsList(
            responseRawDataProcessingResult.validationErrorsMessages
          )
        }),
        title: InvalidExternalDataError.localization.defaultTitle,
        occurrenceLocation: "FetchAPI_Service.retrieveData(namedParameters)"
      });
    }


    return responseRawDataProcessingResult.processedData;
  }


  public static async submitData(
    namedParameters: Readonly<
      (
        { alternatingURI_PathPart: string; } |
        { specificURI: string; }
      ) & {
        requestData: Readonly<ParsedJSON>;
        HTTP_Method?: HTTP_Methods;
        headers?: { readonly [headerName: string]: string; };
      }
    >
  ): Promise<void>;

  public static async submitData<RawValidResponseData>(
    namedParameters: Readonly<
      (
        { alternatingURI_PathPart: string; } |
        { specificURI: string; }
      ) & {
        requestData: Readonly<ParsedJSON>;
        HTTP_Method?: HTTP_Methods;
        validResponseDataSpecification: RawObjectDataProcessor.ObjectDataSpecification;
        headers?: { readonly [headerName: string]: string; };
      }
    >
  ): Promise<RawValidResponseData>;


  public static async submitData<RawValidResponseData extends ParsedJSON>(
    namedParameters:
      Readonly<
        (
          { alternatingURI_PathPart: string; } |
          { specificURI: string; }
        ) & {
          requestData: Readonly<ParsedJSON>;
          HTTP_Method?: HTTP_Methods;
          validResponseDataSpecification?: RawObjectDataProcessor.ObjectDataSpecification;
          headers?: { [headerName: string]: string; };
        }
      >

    /* 〔 ESLint抑制論証 〕 この場合は"validResponseDataSpecification"の有無に応じてRawValidResponseDataを返すか、何も返さない。 */
    /* eslint-disable-next-line @typescript-eslint/no-invalid-void-type */
  ): Promise<RawValidResponseData | void> {

    let targetURI: string;

    if ("alternatingURI_PathPart" in namedParameters) {

      if (isNull(FetchAPI_Service.API_ServerURI_ConstantPart)) {
        Logger.throwErrorAndLog({
          errorInstance: new DataSubmittingFailedError({
            customMessage: "If 'alternatingURI_PathPart' desired, the constant part of API server URI must be " +
                "set via 'FetchAPI_Service.setAPI_ServerURI_ConstantPart()' while it has not been done."
          }),
          title: DataSubmittingFailedError.localization.defaultTitle,
          occurrenceLocation: "FetchAPI_Service.submitData(namedParameters)"
        });
      }


      const API_CONSTANT_URI_PATH_WITHOUT_TRAILING_SLASH: string = FetchAPI_Service.API_ServerURI_ConstantPart;

      targetURI = encodeURI(
        `${ API_CONSTANT_URI_PATH_WITHOUT_TRAILING_SLASH }/` +
          `${ removeSpecificCharacterFromCertainPosition({
            targetString: namedParameters.alternatingURI_PathPart,
            targetCharacter: "/",
            fromFirstPosition: true
          }) }`
      );

    } else {
      targetURI = encodeURI(namedParameters.specificURI);
    }


    let response: Response;

    try {

      response = await fetch(targetURI, {
        mode: "cors",
        method: namedParameters.HTTP_Method ?? HTTP_Methods.post,
        body: JSON.stringify(namedParameters.requestData),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          ...namedParameters.headers ?? {}
        },
        credentials: "include"
      });

    } catch (error: unknown) {
      Logger.throwErrorAndLog({
        errorInstance: new DataSubmittingFailedError({ customMessage: "サーバとの接続中エラーが発生した。" }),
        title: DataSubmittingFailedError.localization.defaultTitle,
        occurrenceLocation: "FetchAPI_Service.submitData(  namedParameters)",
        wrappableError: error
      });
    }


    let responseRawData: unknown;

    try {
      responseRawData = await response.json();
    } catch (error: unknown) {
      Logger.throwErrorAndLog({
        errorInstance: new DataSubmittingFailedError({ customMessage: "データ復号中エラー発生。" }),
        title: DataSubmittingFailedError.localization.defaultTitle,
        occurrenceLocation: "FetchAPI_Service.submitData(  namedParameters)",
        wrappableError: error
      });
    }


    if (!response.ok) {
      Logger.throwErrorAndLog({
        errorInstance: new DataSubmittingFailedError({
          customMessage: `サーバのリスポンスは正常と異なる：\nStatus code: ${ response.status }\nStatus text: ${ response.statusText }`,
          additionalData: responseRawData
        }),
        title: DataSubmittingFailedError.localization.defaultTitle,
        occurrenceLocation: "FetchAPI_Service.retrieveData(  namedParameters)",
        additionalData: responseRawData
      });
    }


    if (isUndefined(namedParameters.validResponseDataSpecification)) {
      return;
    }


    const responseRawDataProcessingResult: RawObjectDataProcessor.ProcessingResult<RawValidResponseData> =
        RawObjectDataProcessor.process(responseRawData, namedParameters.validResponseDataSpecification);

    if (responseRawDataProcessingResult.rawDataIsInvalid) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidExternalDataError({
          mentionToExpectedData: "リスポンスデータ",
          messageSpecificPart: RawObjectDataProcessor.formatValidationErrorsList(
              responseRawDataProcessingResult.validationErrorsMessages
          )
        }),
        title: InvalidExternalDataError.localization.defaultTitle,
        occurrenceLocation: "FetchAPI_Service.retrieveData(  namedParameters)"
      });
    }


    return responseRawDataProcessingResult.processedData;
  }

  private static serializeQueryParameters(queryParameters: ParsedJSON_Object): string {
    return QueryString.stringify(queryParameters, { encode: false });
  }
}


namespace FetchAPI_Service {

  export namespace DataRetrieving {
    export type NamedParameters =
        Readonly<
          (
            { alternatingURI_PathPart: string; } |
            { specificURI: string; }
          ) &
          {
            URI_QueryParameters?: Readonly<ParsedJSON_Object>;
            validResponseDataSpecification: Readonly<RawObjectDataProcessor.ObjectDataSpecification>;
            HTTP_Headers?: { readonly [headerName: string]: string; };
            URI_QueryParametersCustomSerializer?: (URI_QueryParameters: ParsedJSON_Object) => string;
          }
        >;
  }
}


export default FetchAPI_Service;
