import * as PearRequest from "pear-request";

let pipe = Pear.worker.run(`../pearprojects-core`);

Pear.teardown(() => {
  pipe.destroy();
});

Pear.updates(() => {
  console.log("UPDATING");
  Pear.reload();
});

// @ts-ignore
globalThis.XMLHttpRequest = PearRequest.create(pipe);
