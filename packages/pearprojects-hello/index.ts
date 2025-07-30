import b4a from "b4a";
import htm from "htm";
import { h } from "preact";
import { render } from "preact-render-to-string";
import { Router } from "./router";

const pipe = Pear.worker.pipe();

if (!pipe) {
  console.error(
    "Not a worker, run this via `const pipe = Pear.worker.run('<link>')`"
  );
  Pear.exit(1);
}

// Initialize htm with Preact
const html = htm.bind(h);

function App(props: { name: string; count: number }) {
  return html`
    <style>
      body {
        background-color: #fff;
      }
      h1 {
        color: red;
      }
    </style>
    <div id="hello">
      <h1>Hello ${props.name}!</h1>
      <h2>Count: ${props.count}</h2>
      <button hx-put="/count" hx-swap="innerHTML" hx-target="#hello">
        Click me
      </button>
    </div>
  `;
}

let count = 0;
let name = "World";

// Create router instance
const router = new Router(pipe);

// Register routes
router.get("/app", (req, res) => {
  const response = render(h(App, { name: name, count: count }));
  console.log("sending response", response);
  res.body = response;
});

router.put("/count", (req, res) => {
  count++;
  res.body = `<h1>Hello ${name}!</h1>
    <h2>Count: ${count}</h2>
    <button
      hx-put="/count"
      hx-swap="innerHTML"
      hx-target="#hello"
    >
      Click me
    </button>`;
});

// Handle incoming messages
pipe.on("data", async (data) => {
  const message = b4a.toString(data as Uint8Array, "utf-8");
  console.log("received message", message);
  try {
    const parsedMessage = JSON.parse(message);
    await router.processMessage(parsedMessage);
  } catch (error) {
    console.log(message);
  }
});
