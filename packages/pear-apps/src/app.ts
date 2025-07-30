import b4a from "b4a";

let app = sessionStorage.getItem("app") || "hello";
let pipe = Pear.worker.run(`../pearprojects-${app}`);

Pear.teardown(() => {
  pipe.destroy();
});

Pear.updates(() => Pear.reload());

const pendingRequests: Record<string, PearRequest> = {};

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
  const message = b4a.toString(data as Uint8Array, "utf-8");
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
  events: Record<string, (event: any) => void> = {};

  addEventListener(event: string, callback: (event: any) => void) {
    console.log("addEventListener", event, callback);
    this.events[event] = callback;
  }
}

class PearRequest {
  method?: string;
  url?: string;
  mimeType?: string;

  readyState: number = 0;
  headers: Record<string, string> = {};
  events: Record<string, (event: any) => void> = {};

  _responseHeaders?: Record<string, string>;
  response?: Buffer;
  status?: number;
  statusText?: string;

  onload?: () => void;

  getAllResponseHeaders() {
    return {
      ...this._responseHeaders,
    };
  }

  get responseText() {
    return this.response?.toString("utf-8");
  }

  get responseType() {
    return this.mimeType;
  }

  open(method: string, url: string) {
    console.log("open", method, url);
    this.method = method;
    this.url = url;
    this.readyState = 1;
  }

  send(body: any) {
    console.log("send", body);
    const id = crypto.randomUUID();

    this.readyState = 2;

    pendingRequests[id] = this;

    pipe.write(
      b4a.from(
        JSON.stringify({
          id: id,
          method: this.method,
          url: this.url,
          body: body,
        }),
        "utf-8"
      )
    );
  }

  upload = new PearRequestUpload();

  overrideMimeType(mimeType: string) {
    this.mimeType = mimeType;
  }

  setRequestHeader(header: string, value: string) {
    this.headers[header] = value;
  }

  addEventListener(event: string, callback: (event: any) => void) {
    console.log("addEventListener", event, callback);
    this.events[event] = callback;
  }
}

// @ts-ignore
globalThis.XMLHttpRequest = PearRequest;

class Worker {
  constructor(private pipe: any) {
    this.pipe = pipe;
  }

  postMessage(message: any) {
    console.log("sending", message);
    this.pipe.write(b4a.from(message, "utf-8"));
  }

  setState(state: any) {
    this.postMessage(
      JSON.stringify({
        type: "setState",
        state: state,
      })
    );
  }
}

// @ts-ignore
globalThis.Worker = new Worker(pipe);
