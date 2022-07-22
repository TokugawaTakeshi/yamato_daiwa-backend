import { ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";


type DefaultConfig = Readonly<{
  IP_Address: string;
  HTTP_Port: number;
}>;


const DefaultConfig: DefaultConfig = {
  IP_Address: "127.0.0.1",
  HTTP_Port: ProtocolDependentDefaultPorts.HTTP
};


export default DefaultConfig;
