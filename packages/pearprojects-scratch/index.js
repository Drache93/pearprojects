// index.ts
import b4a from "b4a";
var { versions } = Pear;
console.log("Pear terminal application running");
console.log(await versions());
var pipe = Pear.worker.run("../pearprojects-core");
pipe.write(JSON.stringify({
  type: "message",
  message: "Hello, world!"
}) + `
`);
pipe.write(JSON.stringify({
  type: "get-all-projects"
}) + `
`);
pipe.on("data", (data) => {
  console.log(b4a.toString(data, "utf-8"));
});
