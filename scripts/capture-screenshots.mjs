import puppeteer from "puppeteer-core";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const screenshotsDir = path.join(rootDir, "docs", "screenshots");

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3009;
const BASE_URL = `http://localhost:${PORT}`;

const VIEWS = [
  { name: "01-cozy-blush-light.png", url: `${BASE_URL}/gallery?view=cozy-light` },
  { name: "02-cozy-blush-dark.png", url: `${BASE_URL}/gallery?view=cozy-dark` },
  { name: "03-midnight-glow-dark.png", url: `${BASE_URL}/gallery?view=glow-dark` },
  { name: "04-midnight-glow-light.png", url: `${BASE_URL}/gallery?view=glow-light` },
  { name: "05-paper-diary-light.png", url: `${BASE_URL}/gallery?view=paper-light` },
  { name: "06-paper-diary-dark.png", url: `${BASE_URL}/gallery?view=paper-dark` },
  { name: "07-sticker-picker.png", url: `${BASE_URL}/gallery?view=stickers` },
  { name: "08-appearance-modal.png", url: `${BASE_URL}/gallery?view=appearance` },
  { name: "09-wallpaper-modal.png", url: `${BASE_URL}/gallery?view=wallpaper` },
  { name: "10-active-wallpaper.png", url: `${BASE_URL}/gallery?view=wallpaper-active` },
  { name: "11-decoy-planner.png", url: `${BASE_URL}/` },
];

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 800));
  }
  throw new Error("Server failed to respond within timeout");
}

async function run() {
  console.log("[Capture] Starting next start on port", PORT);
  const server = spawn("npm.cmd", ["run", "start", "--", "-p", String(PORT)], {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
  });

  try {
    await waitForServer(`${BASE_URL}/gallery?view=cozy-light`);
    console.log("[Capture] Server ready. Launching headless Chrome...");

    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
      defaultViewport: {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    });

    const page = await browser.newPage();

    for (const view of VIEWS) {
      console.log(`[Capture] Navigating to ${view.name}...`);
      await page.goto(view.url, { waitUntil: "networkidle0", timeout: 20000 });
      await new Promise((r) => setTimeout(r, 600)); // allow fonts and SVGs to settle

      const dest = path.join(screenshotsDir, view.name);
      await page.screenshot({ path: dest, fullPage: false });
      console.log(`[Capture] Saved ${dest}`);
    }

    await browser.close();
    console.log("[Capture] All screenshots captured successfully!");
  } finally {
    console.log("[Capture] Stopping Next.js server...");
    // Kill the server process tree
    if (server.pid) {
      spawn("taskkill", ["/pid", String(server.pid), "/f", "/t"], { stdio: "ignore" });
    }
  }
}

run().catch((err) => {
  console.error("[Capture Error]", err);
  process.exit(1);
});
