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

// In-memory file storage (in a real app, this would be persistent)
const files: Array<{
  id: string;
  name: string;
  size: number;
  content: string;
  uploadedAt: Date;
}> = [];

function FileSharingApp() {
  return html`
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0;
        padding: 20px;
        min-height: 100vh;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 2.5em;
        font-weight: 300;
      }
      .content {
        padding: 30px;
      }
      .upload-section {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 30px;
        border: 2px dashed #dee2e6;
        text-align: center;
      }
      .upload-section:hover {
        border-color: #667eea;
        background: #f0f2ff;
      }
      .file-input {
        display: none;
      }
      .upload-btn {
        background: #667eea;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.3s ease;
      }
      .upload-btn:hover {
        background: #5a6fd8;
        transform: translateY(-2px);
      }
      .files-section h2 {
        color: #333;
        margin-bottom: 20px;
        font-weight: 500;
      }
      .file-list {
        display: grid;
        gap: 15px;
      }
      .file-item {
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
      }
      .file-item:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      .file-info {
        flex: 1;
      }
      .file-name {
        font-weight: 600;
        color: #333;
        margin-bottom: 5px;
      }
      .file-meta {
        color: #6c757d;
        font-size: 14px;
      }
      .file-actions {
        display: flex;
        gap: 10px;
      }
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
      }
      .btn-download {
        background: #28a745;
        color: white;
      }
      .btn-download:hover {
        background: #218838;
      }
      .btn-delete {
        background: #dc3545;
        color: white;
      }
      .btn-delete:hover {
        background: #c82333;
      }
      .empty-state {
        text-align: center;
        color: #6c757d;
        padding: 40px;
      }
      .empty-state h3 {
        margin-bottom: 10px;
        color: #495057;
      }
    </style>
    <div class="container">
      <div class="header">
        <h1>📁 Pear File Share</h1>
        <p>Simple, secure file sharing powered by Pear</p>
      </div>
      <div class="content">
        <div class="upload-section">
          <h3>Upload Files</h3>
          <p>Click to select files or drag and drop them here</p>
          <input type="file" id="fileInput" class="file-input" multiple />
          <button
            class="upload-btn"
            onclick="document.getElementById('fileInput').click()"
          >
            📁 Choose Files
          </button>
        </div>

        <div class="files-section">
          <h2>Your Files</h2>
          <div id="fileList" class="file-list">
            ${files.length === 0
              ? html`
                  <div class="empty-state">
                    <h3>📂 No files yet</h3>
                    <p>Upload your first file to get started!</p>
                  </div>
                `
              : files.map(
                  (file) => html`
                    <div class="file-item">
                      <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-meta">
                          ${(file.size / 1024).toFixed(1)} KB • Uploaded
                          ${file.uploadedAt.toLocaleDateString()}
                        </div>
                      </div>
                      <div class="file-actions">
                        <button
                          class="btn btn-download"
                          onclick="downloadFile('${file.id}')"
                        >
                          📥 Download
                        </button>
                        <button
                          class="btn btn-delete"
                          onclick="deleteFile('${file.id}')"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  `
                )}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Create router instance
const router = new Router(pipe);

// Register routes
router.get("/app", (req, res) => {
  const response = render(h(FileSharingApp, {}));
  res.body = response;
});

router.post("/upload", (req, res) => {
  try {
    const { name, content } = req.body;
    const fileId = Math.random().toString(36).substr(2, 9);
    const fileSize = content.length;

    files.push({
      id: fileId,
      name: name,
      size: fileSize,
      content: content,
      uploadedAt: new Date(),
    });

    res.body = JSON.stringify({ success: true, fileId });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.body = JSON.stringify({ success: false, error: errorMessage });
  }
});

router.get("/download/:fileId", (req, res) => {
  const fileId = req.url.split("/").pop() || "";
  const file = files.find((f) => f.id === fileId);

  if (file) {
    res.headers = {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.name}"`,
    };
    res.body = file.content;
  } else {
    res.status = 404;
    res.body = "File not found";
  }
});

router.delete("/delete/:fileId", (req, res) => {
  const fileId = req.url.split("/").pop() || "";
  const fileIndex = files.findIndex((f) => f.id === fileId);

  if (fileIndex !== -1) {
    files.splice(fileIndex, 1);
    res.body = JSON.stringify({ success: true });
  } else {
    res.status = 404;
    res.body = JSON.stringify({ success: false, error: "File not found" });
  }
});

router.get("/files", (req, res) => {
  res.headers = { "Content-Type": "application/json" };
  res.body = JSON.stringify(
    files.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      uploadedAt: f.uploadedAt,
    }))
  );
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
