// src/app.ts
import b4a from "b4a";
var app = sessionStorage.getItem("app") || "hello";
var pipe = Pear.worker.run(`../pearprojects-${app}`);
Pear.teardown(() => {
  pipe.destroy();
});
Pear.updates(() => Pear.reload());
var pendingRequests = {};
document.getElementById("change-app")?.addEventListener("click", () => {
  console.log("changed-app");
  pipe.destroy();
  if (app === "hello") {
    app = "world";
  } else {
    app = "hello";
  }
  pipe = Pear.worker.run(`../pearprojects-${app}`);
  sessionStorage.setItem("app", app);
  Pear.reload();
});
pipe.on("data", (data) => {
  const message = b4a.toString(data, "utf-8");
  const { id, body, headers } = JSON.parse(message);
  console.log("from worker", message);
  const pendingRequest = pendingRequests[id];
  if (pendingRequest) {
    pendingRequest.readyState = 4;
    pendingRequest.response = body;
    pendingRequest._responseHeaders = headers;
    pendingRequest.status = 200;
    pendingRequest.statusText = "OK";
    console.log("request", pendingRequest);
    pendingRequest["onload"]?.();
  }
});

class PearRequestUpload {
  events = {};
  addEventListener(event, callback) {
    console.log("addEventListener", event, callback);
    this.events[event] = callback;
  }
}

class PearRequest {
  method;
  url;
  mimeType;
  readyState = 0;
  headers = {};
  events = {};
  _responseHeaders;
  response;
  status;
  statusText;
  onload;
  getAllResponseHeaders() {
    return {
      ...this._responseHeaders
    };
  }
  get responseText() {
    return this.response?.toString("utf-8");
  }
  get responseType() {
    return this.mimeType;
  }
  open(method, url) {
    console.log("open", method, url);
    this.method = method;
    this.url = url;
    this.readyState = 1;
  }
  send(body) {
    console.log("send", body);
    const id = crypto.randomUUID();
    this.readyState = 2;
    pendingRequests[id] = this;
    pipe.write(b4a.from(JSON.stringify({
      id,
      method: this.method,
      url: this.url,
      body
    }), "utf-8"));
  }
  upload = new PearRequestUpload;
  overrideMimeType(mimeType) {
    this.mimeType = mimeType;
  }
  setRequestHeader(header, value) {
    this.headers[header] = value;
  }
  addEventListener(event, callback) {
    console.log("addEventListener", event, callback);
    this.events[event] = callback;
  }
}
globalThis.XMLHttpRequest = PearRequest;

class Worker {
  pipe;
  constructor(pipe2) {
    this.pipe = pipe2;
    this.pipe = pipe2;
  }
  postMessage(message) {
    console.log("sending", message);
    this.pipe.write(b4a.from(message, "utf-8"));
  }
  setState(state) {
    this.postMessage(JSON.stringify({
      type: "setState",
      state
    }));
  }
}
globalThis.Worker = new Worker(pipe);
