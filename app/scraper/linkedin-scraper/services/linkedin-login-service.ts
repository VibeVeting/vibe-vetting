import { Page } from "puppeteer-core";
import type { Protocol } from "devtools-protocol";

export class LinkedinLoginService {
  async loginWithCookies(page: Page): Promise<void> {
      const cookieData ={
        name: "li_at",
        value: process.env.LI_AT_COOKIE || "",
        sameSite: "Lax" as Protocol.Network.CookieSameSite,
        domain: ".linkedin.com",
        httpOnly: true,
        secure: true,
        path: "/",
      }

    await page.setCookie(cookieData);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
    // Wait for the feed to fully load after login
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  async performLogin(page: Page) {
    const username = process.env.LINKEDIN_USERNAME;
    const password = process.env.LINKEDIN_PASSWORD;

    if (!username || !password) {
      throw new Error("LinkedIn credentials are not set in environment variables.");
    }

    await page.waitForSelector('input[name="session_key"]', { timeout: 20000 });
    await page.waitForSelector('input[name="session_password"]', { timeout: 20000 });

    await page.type('input[name="session_key"]', username);
    await page.type('input[name="session_password"]', password);

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => null),
    ]);
  }
}
