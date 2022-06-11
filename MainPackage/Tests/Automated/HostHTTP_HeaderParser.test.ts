import HostHTTP_HeaderParser from "../../Source/Utils/HostHTTP_HeaderParser";
import { strictEqual } from "assert";


describe("HostHTTP_HeaderParser", (): void => {

  const sample: string = "example.com:3000";
  const parsedHTTP_HostHeader: HostHTTP_HeaderParser.ParsedHostHTTP_Header = HostHTTP_HeaderParser.parse(sample, {
    defaultPortForActualProtocol: 3000,
    supportedBasicDomains: [ "example.com" ]
  });

  it("example", (): void => {
    strictEqual(parsedHTTP_HostHeader.port, 3000);
  });

});
