import type URI_QueryParametersDeserializer from "../URI_QueryParametersDeserializer";
import QueryString from "qs";


const URI_QueryParametersDefaultSerializer: URI_QueryParametersDeserializer = QueryString.parse;


export default URI_QueryParametersDefaultSerializer;
