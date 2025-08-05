import { Easybase, type Actions } from "easybase";
import Corestore from "corestore";
import { PearRequestRouter } from "pear-request";
import { h } from "preact";
import { render } from "preact-render-to-string";

// @ts-ignore
import path from "bare-path";
import { App } from "./app";
import { VoteButtons } from "./components/VoteButtons";
import type { ProjectData } from "./types/project";

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
  createOrUpdateProject: async (value, { view }) => {
    console.log("createOrUpdateProject", value);

    await view.put(value.id, value);
  },
};

const store = new Corestore(
  path.join(Pear.config.storage, "pearprojects-test")
);
const easybase = new Easybase(store, {
  viewType: "default",
  actions,
  topic,
});

await easybase.ready();

Pear.teardown(() => easybase.close());

// Create router with your Pear pipe
const router = new PearRequestRouter(pipe);

const starterProjects = [
  {
    id: "1",
    title: "Pear Projects",
    description:
      "A P2P ideas and planning platform for teaming up on next generation of P2P projects",
    logo: "🍐",
    upvotes: 0,
    downvotes: 0,
  },
  {
    id: "2",
    title: "HTMX Support",
    description:
      "Support for HTMX for seamless updates in Pear Terminal apps <> Pear GUI",
    logo: "⚡",
    upvotes: 0,
    downvotes: 0,
  },
  {
    id: "3",
    title: "pEHR",
    description: "pEHR the next generation of EHR is P2P",
    logo: "🚀",
    upvotes: 0,
    downvotes: 0,
  },
];

try {
  for (const project of starterProjects) {
    const value = await easybase.view.get(project.id);
    if (!value) {
      await easybase.createOrUpdateProject(project);
    }
  }

  await easybase.base.update();
} catch (error) {
  console.error("Error", error);
}

// Register routes
router.get("/app", async (req, res) => {
  const stream = await easybase.view.createReadStream({});

  const projects: ProjectData[] = [];

  for await (const project of stream) {
    projects.push(project.value as ProjectData);
  }

  console.log("projects", projects);

  const response = render(h(App, { projects }));
  res.body = response;
});

// Upvote route
router.post("/api/projects/:id/upvote", async (req, res) => {
  // @ts-ignore
  const projectId = req.params.id;

  const result = await easybase.view.get(projectId);
  console.log("project", result);

  if (!result) {
    res.status = 404;
    res.body = "Project not found";
    return;
  }

  const project = result.value as ProjectData;

  if (project) {
    project.upvotes++;
    await easybase.createOrUpdateProject(project);
    await easybase.base.update();

    const response = render(
      h(VoteButtons, {
        projectId,
        upvotes: project.upvotes,
        downvotes: project.downvotes,
      })
    );
    res.body = response;
  } else {
    res.status = 404;
    res.body = "Project not found";
  }
});

// Downvote route
router.post("/api/projects/:id/downvote", async (req, res) => {
  // @ts-ignore
  const projectId = req.params.id;
  const result = await easybase.view.get(projectId);

  if (!result) {
    res.status = 404;
    res.body = "Project not found";
    return;
  }

  const project = result.value as ProjectData;

  if (project) {
    project.downvotes++;
    await easybase.createOrUpdateProject(project);
    await easybase.base.update();

    const response = render(
      h(VoteButtons, {
        projectId,
        upvotes: project.upvotes,
        downvotes: project.downvotes,
      })
    );
    res.body = response;
  } else {
    res.status = 404;
    res.body = "Project not found";
  }
});

// Handle incoming messages
pipe.on("data", async (data: any) => {
  await router.processMessage(data);
});
