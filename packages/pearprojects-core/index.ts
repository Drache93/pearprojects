import { Easybase, type Actions } from "easybase";
import Corestore from "corestore";
import crypto from "bare-crypto";

// @ts-ignore
import path from "bare-path";
import b4a from "b4a";
import { CreateProject, Message } from "../pearprojects-contract";

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

pipe.on("data", async (data: any) => {
  const dataStr = b4a.toString(data, "utf-8");
  try {
    for await (const line of dataStr.split("\n").filter(Boolean)) {
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
          const projects: any[] = [];

          // @ts-ignore
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
    pipe.write(
      JSON.stringify({
        message: "Invalid data",
        error: (error as Error).message,
      })
    );
  }

  // const key = b4a.toString(crypto.randomBytes(32), "hex");

  // const project = {
  //   key,
  //   name: "Test Project",
  //   description: "This is a test project",
  // };

  // console.log("creating project", project);

  // await easybase.createProject(project);
  // await easybase.base.update();

  // const createdProject = await easybase.view.get(key);
  // console.log("created project", createdProject);
});
