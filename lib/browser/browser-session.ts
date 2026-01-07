import { type Browser, connect, type Page } from "puppeteer-core";
import { getInjectionScript } from "./helpers";

interface BrowserSession {
  browser: Browser;
  disconnect: () => Promise<void>;
}

/**
 * Launch a local browser for development using puppeteer-extra with stealth
 */
async function launchLocalBrowser(): Promise<BrowserSession> {
  const puppeteer = await import("puppeteer-extra");
  const StealthPlugin = await import("puppeteer-extra-plugin-stealth");

  puppeteer.default.use(StealthPlugin.default());

  const browser = await puppeteer.default.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: [
      "--js-flags=--expose-gc",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-features=IsolateOrigins,site-per-process",
      "--window-size=1440,900",
    ],
  });

  return {
    browser,
    disconnect: () => browser.close(),
  };
}

/**
 * Connect to browser-service for production
 */
async function connectBrowser(): Promise<BrowserSession> {
  const browserWSEndpoint = process.env.BROWSER_SERVICE_WS_ENDPOINT;
  if (!browserWSEndpoint) {
    throw new Error("BROWSER_SERVICE_WS_ENDPOINT is not set");
  }

  const browser = await connect({ browserWSEndpoint });

  return {
    browser,
    disconnect: () => browser.disconnect(),
  };
}

async function closeSession(page: Page, url: string, disconnect: () => Promise<void>) {
  try {
    try {
      const client = await page.createCDPSession();
      await client.send("HeapProfiler.collectGarbage");
      await client.detach();
    } catch {
      // Ignore errors during GC
    }

    await page.close();
    await disconnect();

    console.log(`🛑 Session closed for page: ${url}`);
  } catch {
    console.log(`⚠️ Error closing session for page: ${url}`);
  }
}

export async function createBrowserSession(url: string) {
  const { browser, disconnect } =
    process.env.NODE_ENV === "development" ? await launchLocalBrowser() : await connectBrowser();

  console.log(`🌐 Visiting: ${url}`);

  const page = await browser.newPage();

  await page.setViewport({ width: 1440, height: 900 });

  await page.evaluateOnNewDocument(getInjectionScript());

  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    const status = response?.status() ?? 0;

    if (status >= 400) {
      throw new Error(`HTTP ${status}`);
    }

    console.log(`✓ Page loaded with (status: ${status})`);

    return {
      browser,
      page,
      closeSession: () => closeSession(page, url, disconnect),
    };
  } catch (err) {
    await closeSession(page, url, disconnect);
    throw err;
  }
}
