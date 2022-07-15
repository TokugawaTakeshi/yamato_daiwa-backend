/* [ Reference ] https://developer.mozilla.org/en-US/docs/Web/HTTP/Status */

export enum InformationalResponsesHTTP_StatusCodes {
  continue = 100,
  switchingProtocols = 101,
  processing = 102,
  earlyHints = 103
}

export enum SuccessfulResponsesHTTP_StatusCodes {
  OK = 200,
  created = 201,
  accepted = 202,
  nonAuthoritativeInformation = 203,
  noContent = 204,
  resetContent = 205,
  partialContent = 206,
  multiStatus = 207,
  alreadyReported = 208,
  IM_Used = 226
}

export enum ClientErrorsHTTP_StatusCodes {
  badRequest = 400,
  unauthorized = 401,
  paymentRequired = 402,
  forbidden = 403,
  notFound = 404,
  methodNotAllowed = 405,
  notAcceptable = 406,
  proxyAuthenticationRequired = 407,
  requestTimeout = 408,
  conflict = 409,
  gone = 410,
  lengthRequired = 411,
  preconditionFailed = 412,
  requestEntityTooLarge = 413,
  requestURL_TooLong = 414,
  unsupportedMediaType = 415,
  requestedRangeNotSatisfiable = 416,
  expectationFailed = 417
}


export enum ServerErrorsHTTP_StatusCodes {
  internalServerError = 500,
  notImplemented = 501,
  badGateway = 502,
  serviceUnavailable = 503,
  gatewayTimeout = 504,
  HTTP_VersionNotSupported = 505
}
