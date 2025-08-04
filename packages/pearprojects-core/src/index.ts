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
import { VoteButtons } from "./components/VoteButtons";

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

const projects = [
  {
    id: "1",
    title: "Pear Projects",
    description:
      "A modern project management platform built with Bun and Preact",
    logo: "🍐",
    upvotes: 0,
    downvotes: 0,
  },
  {
    id: "2",
    title: "HTMX Dashboard",
    description: "Real-time dashboard using HTMX for seamless updates",
    logo: "⚡",
    upvotes: 0,
    downvotes: 0,
  },
  {
    id: "3",
    title: "Bun Runtime",
    description: "Fast JavaScript runtime and toolkit for modern development",
    logo: "🚀",
    upvotes: 0,
    downvotes: 0,
  },
];

// Register routes
router.get("/app", (req, res) => {
  const response = render(h(App, { projects }));
  res.body = response;
});

// Upvote route
router.post("/api/projects/:id/upvote", (req, res) => {
  // @ts-ignore
  const projectId = req.params.id;
  const project = projects.find((p) => p.id === projectId);

  if (project) {
    project.upvotes++;
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
router.post("/api/projects/:id/downvote", (req, res) => {
  // @ts-ignore
  const projectId = req.params.id;
  const project = projects.find((p) => p.id === projectId);

  if (project) {
    project.downvotes++;
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
  const message = JSON.parse(data.toString());
  await router.processMessage(message);
});
