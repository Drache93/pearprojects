// index.ts
import b4a2 from "b4a";
import htm from "htm";
import { h } from "preact";
import { render } from "preact-render-to-string";

// router.ts
import b4a from "b4a";

class Router {
  routes = [];
  pipe;
  constructor(pipe) {
    this.pipe = pipe;
  }
  route(method, path, handler) {
    this.routes.push({ method, path, handler });
  }
  get(path, handler) {
    this.route("GET", path, handler);
  }
  put(path, handler) {
    this.route("PUT", path, handler);
  }
  post(path, handler) {
    this.route("POST", path, handler);
  }
  delete(path, handler) {
    this.route("DELETE", path, handler);
  }
  sendResponse(response) {
    this.pipe.write(b4a.from(JSON.stringify({
      type: "response",
      id: response.id,
      body: response.body,
      headers: response.headers || { "Content-Type": "text/html" },
      status: response.status || 200
    }), "utf-8"));
  }
  async handleRequest(request) {
    const { method, url, id } = request;
    const route = this.routes.find((r) => r.method === method && r.path === url);
    if (route) {
      try {
        const response = {
          id,
          body: "",
          headers: { "Content-Type": "text/html" }
        };
        await route.handler(request, response);
        this.sendResponse(response);
      } catch (error) {
        console.error("Route handler error:", error);
        this.sendResponse({
          id,
          body: "Internal Server Error",
          headers: { "Content-Type": "text/plain" },
          status: 500
        });
      }
    } else {
      this.sendResponse({
        id,
        body: "Not Found",
        headers: { "Content-Type": "text/plain" },
        status: 404
      });
    }
  }
  async processMessage(message) {
    const { method, body, url, id } = message;
    await this.handleRequest({ method, url, body, id });
  }
}

// index.ts
var pipe = Pear.worker.pipe();
if (!pipe) {
  console.error("Not a worker, run this via `const pipe = Pear.worker.run('<link>')`");
  Pear.exit(1);
}
var html = htm.bind(h);
function App(props) {
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
var count = 0;
var name = "World";
var router = new Router(pipe);
router.get("/app", (req, res) => {
  const response = render(h(App, { name, count }));
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
pipe.on("data", async (data) => {
  const message = b4a2.toString(data, "utf-8");
  console.log("received message", message);
  try {
    const parsedMessage = JSON.parse(message);
    await router.processMessage(parsedMessage);
  } catch (error) {
    console.log(message);
  }
});
