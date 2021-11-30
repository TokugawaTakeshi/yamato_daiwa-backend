import RegularExpressionCapturingGroupsMatcher from "../../Source/Utils/RegularExpressionCapturingGroupsMatcher";


console.log(RegularExpressionCapturingGroupsMatcher.findAllMatchings(
    "foo[alpha]=hoge&bar[bravo]=fuga",
    /(?<keyOfFirstLevel>[\w$]+)\[/ug
));


// describe("RegularExpressionCapturingGroupsMatcher", (): void => {
//
//   const sample: string = "foo=alpha&bar=1&baz=1.34&hoge=true&fuga=false&fizz=null";
//
//   it("example", (): void => {
//
//     strictEqual(sample, "SAMPLE");
//   });
//
// });
