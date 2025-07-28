import b4a from "b4a";

const { versions } = Pear;
console.log("Pear terminal application running");
console.log(await versions());

const pipe = Pear.worker.run("../pearprojects-core");

pipe.write(
  JSON.stringify({
    type: "message",
    message: "Hello, world!",
  }) + "\n"
);

pipe.write(
  JSON.stringify({
    type: "get-all-projects",
  }) + "\n"
);

pipe.on("data", (data) => {
  console.log(b4a.toString(data as Uint8Array, "utf-8"));
});
