// index.ts
import { Easybase } from "easybase";
import Corestore from "corestore";
import path from "bare-path";
import b4a from "b4a";

// ../pearprojects-contract/index.ts
import * as z from "zod";
var Message = z.object({
  type: z.enum(["create-project", "message", "get-all-projects"])
});
var CreateProject = z.object({
  type: z.literal("create-project"),
  key: z.string(),
  name: z.string(),
  description: z.string()
});
var GetAllProjects = z.object({
  type: z.literal("get-all-projects")
});

// index.ts
var pipe = Pear.worker.pipe();
if (!pipe) {
  console.error("Not a worker, run this via `const pipe = Pear.worker.run('<link>')`");
  Pear.exit(1);
}
var topic = "0e6d1635dbca6a8cbd5880b98cb6af86888d4681a43eaa87c60e0e45675efa5d";
var actions = {
  createProject: async (value, { view }) => {
    console.log("createProject", value);
    await view.put(value.key, value);
  }
};
var store = new Corestore(path.join(Pear.config.storage, "pearprojects"));
var easybase = new Easybase(store, {
  viewType: "default",
  actions,
  topic
});
await easybase.ready();
Pear.teardown(() => easybase.close());
pipe.on("data", async (data) => {
  const dataStr = b4a.toString(data, "utf-8");
  try {
    for await (const line of dataStr.split(`
`).filter(Boolean)) {
      console.log("line", line);
      const messageData = JSON.parse(line);
      const message = Message.parse(messageData);
      switch (message.type) {
        case "create-project":
          const value = CreateProject.parse(messageData);
          console.log("createProject", value);
          pipe.write(JSON.stringify(value));
          break;
        case "get-all-projects":
          const projects = [];
          for await (const entry of easybase.view.createReadStream()) {
            projects.push(entry);
          }
          pipe.write(JSON.stringify(projects));
          break;
        case "message":
          console.log("message", messageData);
          break;
      }
    }
  } catch (error) {
    console.error(error);
    pipe.write(JSON.stringify({
      message: "Invalid data",
      error: error.message
    }));
  }
});
