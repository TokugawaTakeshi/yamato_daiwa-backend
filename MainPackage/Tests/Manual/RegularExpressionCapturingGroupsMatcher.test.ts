import RegularExpressionCapturingGroupsMatcher from "../../Source/Utils/RegularExpressionCapturingGroupsMatcher";


// eslint-disable-next-line no-console
console.log(RegularExpressionCapturingGroupsMatcher.findAllMatchings(
  "foo[alpha]=hoge&bar[bravo]=fuga",
  /(?<keyOfFirstLevel>[\w$]+)\[/ug
));
