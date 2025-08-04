import { Easybase, type Actions } from "easybase";
import Corestore from "corestore";
import crypto from "bare-crypto";
import { PearRequestRouter } from "pear-request";
import htm from "htm";
import { h } from "preact";
import { render } from "preact-render-to-string";

// @ts-ignore
import path from "bare-path";
import b4a from "b4a";
import { App } from "./app";
import { Counter } from "./components/Counter";

const pipe = Pear.worker.pipe();

if (!pipe) {
  console.error(
    "Not a worker, run this via `const pipe = Pear.worker.run('<link>')`"
  );
  Pear.exit(1);
}

const topic =
  "0e6d1635dbca6a8cbd5880b98cb6af86888d4681a43eaa87c60e0e45675efa5d";

const actions: Actions = {
  createProject: async (value, { view }) => {
    console.log("createProject", value);

    await view.put(value.key, value);
  },
};

const store = new Corestore(path.join(Pear.config.storage, "pearprojects"));
const easybase = new Easybase(store, {
  viewType: "default",
  actions,
  topic,
});

await easybase.ready();

Pear.teardown(() => easybase.close());

// Create router with your Pear pipe
const router = new PearRequestRouter(pipe);

const state = {
  count: 0,
};

// Register routes
router.get("/app", (req, res) => {
  const response = render(h(App, { name: "World", ...state }));
  res.body = response;
});

router.put("/count", (req, res) => {
  state.count++;
  const response = render(h(Counter, { count: state.count }));
  res.body = response;
});

// Handle incoming messages
pipe.on("data", async (data: any) => {
  const message = JSON.parse(data.toString());
  await router.processMessage(message);
});
