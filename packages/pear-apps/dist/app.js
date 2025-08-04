// src/app.ts
import * as PearRequest from "pear-request";
var pipe = Pear.worker.run(`../pearprojects-core`);
Pear.teardown(() => {
  pipe.destroy();
});
Pear.updates(() => {
  console.log("UPDATING");
  Pear.reload();
});
globalThis.XMLHttpRequest = PearRequest.create(pipe);
