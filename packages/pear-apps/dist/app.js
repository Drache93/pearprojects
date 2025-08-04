// src/app.ts
import * as PearRequest from "pear-request";
var pipe = Pear.worker.run(`../pearprojects-core`);
Pear.teardown(() => {
  pipe.destroy();
});
Pear.updates(() => Pear.reload());
globalThis.XMLHttpRequest = PearRequest.create(pipe);
