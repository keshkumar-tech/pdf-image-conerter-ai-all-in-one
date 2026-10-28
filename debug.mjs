import { spawn } from "child_process";
import WebSocket from "ws";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const chrome = spawn(chromePath, [
  "--headless=new",
  "--remote-debugging-port=9222",
  "--no-sandbox",
  "http://localhost:3000/youtube-notes",
  "--disable-gpu",
  "--window-size=1920,1080",
], { detached: true, stdio: "ignore" });

await new Promise((resolve) => setTimeout(resolve, 3000));

const devtools = await fetch("http://localhost:9222/json").then(r => r.json());
const tab = devtools.find(t => t.type === "page" && t.url.includes("localhost:3000"));
if (!tab) {
  console.log("No page tab found.", JSON.stringify(devtools.map(t => ({ type: t.type, url: t.url })), null, 2));
  process.exit(1);
}

const ws = new WebSocket(tab.webSocketDebuggerUrl);
const results = {};

ws.on("open", async () => {
  ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));
  ws.send(JSON.stringify({ id: 2, method: "Console.enable" }));
  ws.send(JSON.stringify({ id: 3, method: "Network.enable" }));

  await new Promise(r => setTimeout(r, 2000));

  ws.send(JSON.stringify({ id: 4, method: "Page.navigate", params: { url: "http://localhost:3000/youtube-notes" } }));

  await new Promise(r => setTimeout(r, 5000));

  // Check root div
  ws.send(JSON.stringify({ id: 11, method: "Runtime.evaluate", params: { expression: "document.querySelector('#root')?.innerHTML?.length || 'no root'" } }));

  // Check for buttons
  ws.send(JSON.stringify({ id: 13, method: "Runtime.evaluate", params: { expression: "document.querySelectorAll('button').length" } }));
  ws.send(JSON.stringify({ id: 14, method: "Runtime.evaluate", params: { expression: "JSON.stringify(Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim().substring(0, 60)))" } }));

  // Check for auth modal
  ws.send(JSON.stringify({ id: 15, method: "Runtime.evaluate", params: { expression: "document.querySelector('[data-testid=\"auth-modal\"]') ? 'modal exists' : 'no modal'" } }));

  // Check for any fixed positioned elements (modals)
  ws.send(JSON.stringify({ id: 16, method: "Runtime.evaluate", params: { expression: "document.querySelectorAll('[class*=\"fixed\"], [class*=\"modal\"], [class*=\"AuthModal\"]').length" } }));

  // Try to click the login button in nav
  ws.send(JSON.stringify({ id: 17, method: "Runtime.evaluate", params: { expression: "const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Login') || b.textContent.includes('Sign up')); if(btn) { btn.click(); 'clicked login button' } else { 'login button not found' }" } }));

  await new Promise(r => setTimeout(r, 3000));

  // Check if modal appeared after click
  ws.send(JSON.stringify({ id: 18, method: "Runtime.evaluate", params: { expression: "document.querySelectorAll('button').length" } }));
  ws.send(JSON.stringify({ id: 19, method: "Runtime.evaluate", params: { expression: "JSON.stringify(Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim().substring(0, 60)))" } }));

  // Check for z-index issues or hidden elements
  ws.send(JSON.stringify({ id: 20, method: "Runtime.evaluate", params: { expression: "const el = document.querySelector('#root > div:first-child'); el ? (getComputedStyle(el).position + ' z:' + getComputedStyle(el).zIndex + ' display:' + getComputedStyle(el).display + ' opacity:' + getComputedStyle(el).opacity) : 'no first child div'" } }));

  await new Promise(r => setTimeout(r, 2000));
});

const consoleErrors = [];
const exceptions = [];

ws.on("message", (data) => {
  try {
    const msg = JSON.parse(data.toString());
    if (msg.method === "Console.messageAdded") {
      const params = msg.params?.message;
      const text = params?.text || "";
      if (params?.level === "error" || text.includes("Error") || text.includes("error")) {
        errors.push(text);
      }
      console.log("Console:", params?.level || "info", text.substring(0, 300));
    }
    if (msg.method === "Runtime.exceptionThrown") {
      exceptions.push(JSON.stringify(msg.params?.exceptionDetails?.exception));
      console.log("EXCEPTION:", JSON.stringify(msg.params?.exceptionDetails?.exception)?.substring(0, 500));
    }
    if (msg.id && [11, 13, 14, 15, 16, 17, 18, 19, 20].includes(msg.id)) {
      results[msg.id] = msg.result?.result?.value !== undefined ? msg.result.result.value : msg.result;
      console.log("Result " + msg.id + ":", JSON.stringify(results[msg.id]).substring(0, 500));
    }
  } catch (e) {
    // ignore parse errors
  }
});

const errors = [];
ws.on("error", (err) => {
  console.log("WS error:", err.message);
});

// Cleanup after 15 seconds
setTimeout(() => {
  chrome.kill();
  console.log("\n=== Summary ===");
  console.log("Console errors:", errors);
  console.log("Exceptions:", exceptions);
  console.log("Results:", results);
  process.exit(0);
}, 15000);
