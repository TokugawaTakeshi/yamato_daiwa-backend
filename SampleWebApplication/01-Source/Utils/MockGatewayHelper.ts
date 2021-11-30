import {
  Logger,
  DataRetrievingFailedError,
  DataSubmittingFailedError,
  getRandomInteger,
  secondsToMilliseconds,
  stringifyAndFormatArbitraryValue
} from "@yamato-daiwa/es-extensions";


class MockGatewayHelper {

  private static readonly MINIMAL_PENDING_PERIOD__SECONDS: number = 1;
  private static readonly MAXIMAL_PENDING_PERIOD__SECONDS: number = 2;


  public static async simulateDataRetrieving<RequestParameters, ResponseData>(
    requestParameters: RequestParameters,
    mockResponseData: ResponseData,
    {
      minimalPendingPeriod__seconds = MockGatewayHelper.MINIMAL_PENDING_PERIOD__SECONDS,
      maximalPendingPeriod__seconds = MockGatewayHelper.MAXIMAL_PENDING_PERIOD__SECONDS,
      simulateError = false,
      printMockedData = false,
      gatewayName,
      transactionName
    }: MockGatewayHelper.SimulationOptions
  ): Promise<ResponseData> {

    return new Promise<ResponseData>(
      (resolve: (responseData: ResponseData) => void, reject: (error: Error) => void): void => {

        setTimeout((): void => {

          if (simulateError) {
            reject(new DataRetrievingFailedError({
              customMessage: "'simulateDataRetrieving(...parameters)'はオプション'simulateError'が'true'に設定してあるので、エラー発生が再現された。"
            }));
            return;
          }

          resolve(mockResponseData);

          Logger.logSuccess({
            title: `${gatewayName}.${transactionName}、データ仮取得完了`,
            description: `リクエストパラメーター：\n${stringifyAndFormatArbitraryValue(requestParameters)}\n` +
                `にとってデータ取得の再現が終わり、${
                    printMockedData ?
                        `下記のデータが生成された:\n${stringifyAndFormatArbitraryValue(mockResponseData)}` :
                        "データが生成された。"
                }`
          });

        }, getRandomInteger({
          minimalValue: secondsToMilliseconds(minimalPendingPeriod__seconds),
          maximalValue: secondsToMilliseconds(maximalPendingPeriod__seconds)
        }));
      }
    );
  }

  public static async simulateDataSubmitting<RequestData, ResponseData>(
    requestData: RequestData,
    mockResponseData: ResponseData,
    {
      minimalPendingPeriod__seconds = MockGatewayHelper.MINIMAL_PENDING_PERIOD__SECONDS,
      maximalPendingPeriod__seconds = MockGatewayHelper.MAXIMAL_PENDING_PERIOD__SECONDS,
      simulateError = false,
      gatewayName,
      transactionName
    }: MockGatewayHelper.SimulationOptions
  ): Promise<ResponseData> {

    return new Promise<ResponseData>(
      (resolve: (responseData: ResponseData) => void, reject: (error: Error) => void): void => {

        setTimeout((): void => {

          if (simulateError) {
            reject(new DataSubmittingFailedError({
              customMessage: "'simulateDataSubmitting(...parameters)'はオプション'simulateError'が'true'に設定してあるので、エラー発生が再現された。"
            }));
            return;
          }

          resolve(mockResponseData);

          Logger.logSuccess({
            title: `${gatewayName}.${transactionName}、データ仮送信完了`,
            description: `リクエストデータ：\n${stringifyAndFormatArbitraryValue(requestData)}\n` +
                `の取得の再現が終わり、返事として下記のデータが生成された:\n${stringifyAndFormatArbitraryValue(mockResponseData)}`
          });

        }, getRandomInteger({
          minimalValue: secondsToMilliseconds(minimalPendingPeriod__seconds),
          maximalValue: secondsToMilliseconds(maximalPendingPeriod__seconds)
        }));
      }
    );
  }

  public static generateValidDataForPaginatedSelection(
      {
        itemsPerPaginationPage,
        itemsCountInOtherPaginationPages,
        itemsCountNotIncludedInSelection
      }: {
        itemsPerPaginationPage: number;
        itemsCountInOtherPaginationPages: number;
        itemsCountNotIncludedInSelection: number;
      }
  ): MockGatewayHelper.ValidDataForPaginatedSelection {
    return {
      totalItemsInSelection: itemsPerPaginationPage + itemsCountInOtherPaginationPages,
      get totalItems(): number {
        return this.totalItemsInSelection + itemsCountNotIncludedInSelection;
      }
    };
  }
}


namespace MockGatewayHelper {

  export type SimulationOptions = {
    readonly minimalPendingPeriod__seconds?: number;
    readonly maximalPendingPeriod__seconds?: number;
    readonly simulateError?: boolean;
    readonly printMockedData?: boolean;
    readonly gatewayName: string;
    readonly transactionName: string;
  };

  export type ValidDataForPaginatedSelection = {
    readonly totalItemsInSelection: number;
    readonly totalItems: number;
  };
}


export default MockGatewayHelper;
