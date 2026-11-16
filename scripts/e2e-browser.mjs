// End-to-end browser test: drives the real app in Chromium over CDP.
// Provider HTTP calls are intercepted at the network layer (Fetch domain), so the
// app's real fetch, CORS, SSE parsing, and stores all run. Each request is checked
// against the provider's wire format and the model must be on the free list.
//
// Usage: node scripts/e2e-browser.mjs <page-ws-url> <app-base-url>
//   e.g. node scripts/e2e-browser.mjs ws://127.0.0.1:9225/devtools/page/ID http://172.17.0.1:4300/rencanai
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const [, , WS_URL, APP] = process.argv;
if (!WS_URL || !APP) {
  console.error("usage: node scripts/e2e-browser.mjs <page-ws-url> <app-base-url>");
  process.exit(2);
}

// Read the catalog from the source of truth so the test cannot drift from the app.
const here = dirname(fileURLToPath(import.meta.url));
const catalog = readFileSync(join(here, "../src/lib/providers.ts"), "utf8");
const providerBlocks = [...catalog.matchAll(/id: "(gemini|openrouter|groq)",[\s\S]*?defaultModel: "([^"]+)",\s*models: \[([\s\S]*?)\n {4}\],/g)];
const PROVIDERS = providerBlocks.map(([, id, defaultModel, models]) => ({
  id,
  defaultModel,
  models: [...models.matchAll(/id: "([^"]+)"/g)].map((m) => m[1]),
}));
const FREE = new Set(PROVIDERS.flatMap((p) => p.models));

// LIVE mode: OpenRouter calls go to the real API with OPENROUTER_API_KEY (never stored in files).
const LIVE_KEY = process.env.OPENROUTER_API_KEY ?? "";
const LIVE = Boolean(LIVE_KEY);
if (LIVE) PROVIDERS.splice(0, PROVIDERS.length, ...PROVIDERS.filter((p) => p.id === "openrouter"));

const results = [];
const requestLog = [];
let id = 0;
const pending = new Map();
const listeners = [];

const ws = new WebSocket(WS_URL);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve);
  ws.addEventListener("error", reject);
});

ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else if (msg.method) {
    for (const l of listeners) l(msg);
  }
});

function send(method, params = {}, timeoutMs = 20000) {
  const mid = ++id;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(mid);
      reject(new Error(`CDP timeout: ${method}`));
    }, timeoutMs);
    pending.set(mid, (msg) => {
      clearTimeout(timer);
      if (msg.error) reject(new Error(`${method}: ${msg.error.message}`));
      else resolve(msg.result);
    });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function evaluate(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(`eval: ${r.exceptionDetails.text}`);
  return r.result.value;
}

async function waitFor(expression, label, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const v = await evaluate(expression);
      if (v) return v;
    } catch {
      // page may still be navigating
    }
    await sleep(250);
  }
  throw new Error(`timeout waiting for: ${label}`);
}

async function navigate(path) {
  await send("Page.navigate", { url: `${APP}${path}` });
  await waitFor(`document.readyState === "complete"`, `load ${path}`, 30000);
  await sleep(400);
}

// React-safe value setter: native setter + bubbling event so React state updates.
const HELPERS = `
window.__setNative = (el, value) => {
  const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
  el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
};
window.__clickButton = (text) => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === text);
  if (!b || b.disabled) return false;
  b.click();
  return true;
};
`;

async function setField(selector, value) {
  return evaluate(`(() => { const el = ${selector}; if (!el) return false; window.__setNative(el, ${JSON.stringify(value)}); return true; })()`);
}

function requestModel(req) {
  if (req.url.includes("generativelanguage")) {
    return decodeURIComponent(req.url.split("/models/")[1].split(":")[0]);
  }
  return JSON.parse(req.postData || "{}").model;
}

function requestKey(req) {
  const h = req.headers;
  if (req.url.includes("generativelanguage")) return h["x-goog-api-key"] ?? h["X-Goog-Api-Key"];
  return (h.Authorization ?? h.authorization ?? "").replace(/^Bearer /, "");
}

function providerReply(req) {
  const gemini = req.url.includes("generativelanguage");
  const body = req.postData ? JSON.parse(req.postData) : {};
  const model = requestModel(req);
  const key = requestKey(req);
  const stream = gemini ? req.url.includes("alt=sse") : body.stream === true;
  const wantsFreeModel = FREE.has(model);

  if (key === "bad-key") {
    return { status: 401, json: { error: { message: "API key not valid. Please pass a valid API key." } } };
  }
  if (!wantsFreeModel) {
    return { status: 404, json: { error: { message: `model ${model} not found` } } };
  }
  if (!stream) {
    // connection test: a single JSON answer
    return gemini
      ? { status: 200, json: { candidates: [{ content: { parts: [{ text: "ya" }] } }] } }
      : { status: 200, json: { choices: [{ message: { content: "ya" } }] } };
  }
  const text = "## Ringkasan\n\nTim butuh alat untuk menyusun tugas harian.\n\n## Tugas\n\n- Susun struktur data\n- Halaman login\n";
  const parts = text.match(/[\s\S]{1,24}/g);
  let sse;
  if (gemini) {
    // Gemini alt=sse uses CRLF framing: exercises the CRLF path of the app's parser.
    sse = parts
      .map((p) => `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: p }], role: "model" } }] })}\r\n\r\n`)
      .join("");
  } else {
    sse =
      parts.map((p) => `data: ${JSON.stringify({ choices: [{ delta: { content: p } }] })}\n\n`).join("") +
      "data: [DONE]\n\n";
  }
  return { status: 200, sse };
}

const CORS = [
  { name: "Access-Control-Allow-Origin", value: "*" },
  { name: "Access-Control-Allow-Headers", value: "authorization, content-type, x-goog-api-key" },
  { name: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
];

listeners.push(async (msg) => {
  if (msg.method !== "Fetch.requestPaused") return;
  const { requestId, request } = msg.params;
  if (request.method === "OPTIONS") {
    // CORS preflight: answer like the real providers do, then let the real request through.
    await send("Fetch.fulfillRequest", { requestId, responseCode: 204, responseHeaders: CORS, body: "" }).catch(() => {});
    return;
  }
  const reply = providerReply(request);
  requestLog.push({
    url: request.url.split("?")[0],
    method: request.method,
    model: requestModel(request),
    authOk: Boolean(requestKey(request)),
    status: reply.status,
  });
  const headers = [{ name: "Content-Type", value: reply.sse ? "text/event-stream" : "application/json" }, ...CORS];
  const payload = reply.sse ?? JSON.stringify(reply.json);
  await send("Fetch.fulfillRequest", {
    requestId,
    responseCode: reply.status,
    responseHeaders: headers,
    body: Buffer.from(payload, "utf8").toString("base64"),
  }).catch((e) => console.log("  fulfill failed:", e.message));
});

async function step(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail: detail ?? "" });
    console.log(`PASS  ${name}${detail ? `  (${detail})` : ""}`);
  } catch (err) {
    results.push({ name, ok: false, detail: err.message });
    console.log(`FAIL  ${name}  -> ${err.message}`);
  }
}

// ---- setup ----
await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Fetch.enable", {
  patterns: [
    { urlPattern: "https://generativelanguage.googleapis.com/*", requestStage: "Request" },
    ...(LIVE ? [] : [{ urlPattern: "https://openrouter.ai/*", requestStage: "Request" }]),
    { urlPattern: "https://api.groq.com/*", requestStage: "Request" },
  ],
});

async function settingsRun(provider, model, key) {
  await navigate("/settings");
  await waitFor(`!!document.querySelector('select')`, "settings page");
  await evaluate(HELPERS);
  await setField(`document.querySelectorAll("select")[0]`, provider);
  await sleep(200);
  await setField(`document.querySelector('input[aria-label="API key"]')`, key);
  await setField(`document.querySelectorAll("select")[1]`, model);
  await sleep(150);
}

async function generateRun(model, provider) {
  await navigate("/prd/create");
  await evaluate(HELPERS);
  await waitFor(`!!document.querySelector('input[placeholder^="Contoh"]')`, "create page");
  await setField(`document.querySelector('input[placeholder^="Contoh"]')`, `PRD uji ${provider}`);
  await setField(`document.querySelector('input[placeholder^="Aplikasi untuk"]')`, "Aplikasi tugas harian tim.");
  await waitFor(`window.__clickButton("Buat PRD dengan AI")`, "generate button enabled");
  const path = await waitFor(
    `location.pathname.match(/\\/prd\\/[0-9a-f-]{36}$/) ? location.pathname : ""`,
    "redirect to PRD editor",
    LIVE ? 240000 : 60000
  );
  await waitFor(`!!document.querySelector("h2") && document.body.innerText.includes("Ringkasan")`, "PRD content rendered", LIVE ? 60000 : 20000);
  const headingText = await evaluate(`[...document.querySelectorAll("h2")].map(h => h.textContent).join(" | ")`);
  return `${path} | ${headingText}`;
}

// ---- 1. invalid key is reported clearly (no silent failure) ----
if (!LIVE) await step("invalid key shows clear error in Settings", async () => {
  await settingsRun("gemini", "gemini-3.8-flash", "bad-key");
  await evaluate(HELPERS);
  await evaluate(`window.__clickButton("Tes API key")`);
  const text = await waitFor(
    `(() => { const s = document.querySelector('[role="status"]'); return s && s.textContent.includes("API key tidak valid") ? s.textContent : ""; })()`,
    "invalid-key message",
    30000
  );
  return text.slice(0, 80);
});

// ---- 2. every free model of every provider: test, save, generate a PRD ----
for (const p of PROVIDERS) {
  for (const model of p.models) {
    const label = `${p.id} / ${model}`;
    await step(`${label}: key test + save + generate PRD`, async () => {
      const key = LIVE ? LIVE_KEY : `e2e-${p.id}-key`;
      await settingsRun(p.id, model, key);
      await evaluate(HELPERS);
      await evaluate(`window.__clickButton("Tes API key")`);
      await waitFor(
        `(() => { const s = document.querySelector('[role="status"]'); return s && s.textContent.includes("Kunci valid") ? true : false; })()`,
        "connection ok",
        30000
      );
      await evaluate(`window.__clickButton("Simpan Pengaturan")`);
      await waitFor(
        `(() => { const s = document.querySelector('[role="status"]'); return s && s.textContent.startsWith("Tersimpan") ? true : false; })()`,
        "saved",
        10000
      );
      const detail = await generateRun(model, p.id);
      const last = [...requestLog].reverse().find((r) => r.model === model && r.status === 200 && r.url.includes(p.id === "gemini" ? "generativelanguage" : p.id === "groq" ? "groq" : "openrouter"));
      if (!last) throw new Error("no successful provider request with this model was observed");
      return `${detail.slice(0, 90)}`;
    });
  }
}

// ---- 3. summary ----
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
console.log(`provider requests observed: ${requestLog.length}`);
const byProvider = requestLog.reduce((acc, r) => {
  acc[r.url] = (acc[r.url] ?? 0) + 1;
  return acc;
}, {});
console.log(byProvider);
ws.close();
process.exit(failed.length ? 1 : 0);
