import { Page } from "puppeteer-core";

type Experience = {
  title: string;
  company: string | null;
  location?: string | null;
  dateRange?: string | null;
};

type Education = {
  school: string;
  degree?: string;
  dateRange?: string;
};

export type ProfileSummary = {
  followers: string | null;
  name: string | null;
  headline: string | null;
  location: string | null;
  about: string | null;
  experiences: Experience[];
  education: Education[];
};

function textOrNull(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export class LinkedinProfileExtractionService {
  async extractProfile(page: Page, profileUrl: string): Promise<ProfileSummary> {
    await page.goto(profileUrl, { waitUntil: "domcontentloaded", timeout: 45000 });

    // Wait for the main profile container; bail fast if it never renders
    await page.waitForSelector("main", { timeout: 30000 });

    const name = await page.$eval("main h1", (el) => window.puppeteer.visibleText(el)).catch(() => null);
    const headline = await page
      .$eval("main .text-body-medium.break-words", (el) => window.puppeteer.visibleText(el))
      .catch(() => null);
    const location = await page
      .$eval("main .text-body-small.inline.t-black--light.break-words", (el) => window.puppeteer.visibleText(el))
      .catch(() => null);
    const followers = await page
      .$$eval("main .text-body-small.t-black--light", (els) => {
        const target = els.find((el) => {
          const text = el.textContent?.toLowerCase() || "";
          return text.includes("followers");
        });
        return target ? window.puppeteer.visibleText(target) || null : null;
      })
      .catch(() => null);

    // Expand About if collapsed
    await page
      .$$eval("main .inline-show-more-text__button.inline-show-more-text__button--light.link", (els) => {
        const trigger = els.find((b) => b.textContent?.toLowerCase().includes("see more"));
        if (trigger) (trigger as HTMLElement).click();
      })
      .catch(() => null);

    const about = await page
      .$$eval("main .artdeco-card.pv-profile-card", (cards) => {
        const aboutCard = cards.find((card) => card.querySelector("#about"));
        if (!aboutCard) return null;

        const aboutSection = aboutCard.querySelector(".t-black");
        return aboutSection ? window.puppeteer.visibleText(aboutSection) : null;
      })
      .catch(() => null);

    const experiences = await (async () => {
      const seeAllExp = await page.$("#navigation-index-see-all-experiences");
      if (seeAllExp) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null),
          seeAllExp.click(),
        ]);

        await page
          .waitForSelector("main div[data-view-name='profile-component-entity']", { timeout: 15000 })
          .catch(() => null);

        const expanded = await page.$$eval("main div[data-view-name='profile-component-entity']", (items) => {
          const results: Array<{ title: string; company: string; dateRange: string; location: string }> = [];
          items.forEach((item) => {
            const { visibleText } = window.puppeteer;
            const bolds = Array.from(item.querySelectorAll(".t-bold"));

            if (bolds.length > 1) {
              const companyName = visibleText(bolds[0]);
              const parentMeta = Array.from(item.querySelectorAll(".t-black--light"))
                .map((m) => visibleText(m))
                .filter(Boolean);
              const parentLocation = parentMeta.find((t) => !/\d/.test(t)) ?? parentMeta[0] ?? "";

              bolds.slice(1).forEach((roleNode) => {
                const scope = (roleNode.closest("li") || roleNode.closest("[data-view-name]") || item) as Element;
                const metaTexts = Array.from(scope.querySelectorAll(".t-black--light"))
                  .map((m) => visibleText(m))
                  .filter(Boolean);
                const dateRange = metaTexts.find((t) => /\d/.test(t)) ?? metaTexts[metaTexts.length - 1] ?? "";
                const location = metaTexts.find((t) => !/\d/.test(t)) ?? parentLocation;
                const title = visibleText(roleNode);
                results.push({ title, company: companyName, dateRange, location });
              });
              return;
            }

            const title = visibleText(bolds[0] || null);
            const company = visibleText(item.querySelector(".t-normal"));
            const metaTexts = Array.from(item.querySelectorAll(".t-black--light"))
              .map((m) => visibleText(m))
              .filter(Boolean);
            const dateRange = metaTexts.find((t) => /\d/.test(t)) ?? metaTexts[metaTexts.length - 1] ?? "";
            const location = metaTexts.find((t) => !/\d/.test(t)) ?? metaTexts[0] ?? "";
            results.push({ title, company, dateRange, location });
          });
          return results;
        });

        const backBtn = await page.$('button[aria-label="Back to the main profile page"]');
        if (backBtn) {
          await Promise.all([
            page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null),
            backBtn.click(),
          ]);
        } else {
          await page.goBack({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null);
        }
        await page.waitForSelector("main", { timeout: 15000 }).catch(() => null);

        return expanded;
      }

      // Fallback: inline experiences on profile page
      return await page.$$eval("main .artdeco-card.pv-profile-card", (cards) => {
        const expCard = cards.find((card) => card.querySelector("#experience"));
        if (!expCard) return [] as any[];
        const items = Array.from(expCard.querySelectorAll("div[data-view-name='profile-component-entity']"));
        const results: Array<{ title: string; company: string; dateRange: string; location: string }> = [];
        items.forEach((item) => {
          const { visibleText } = window.puppeteer;
          const bolds = Array.from(item.querySelectorAll(".t-bold"));

          if (bolds.length > 1) {
            const companyName = visibleText(bolds[0]);
            const parentMeta = Array.from(item.querySelectorAll(".t-black--light"))
              .map((m) => visibleText(m))
              .filter(Boolean);
            const parentLocation = parentMeta.find((t) => !/\d/.test(t)) ?? parentMeta[0] ?? "";

            bolds.slice(1).forEach((roleNode) => {
              const scope = (roleNode.closest("li") || roleNode.closest("[data-view-name]") || item) as Element;
              const metaTexts = Array.from(scope.querySelectorAll(".t-black--light"))
                .map((m) => visibleText(m))
                .filter(Boolean);
              const dateRange = metaTexts.find((t) => /\d/.test(t)) ?? metaTexts[metaTexts.length - 1] ?? "";
              const location = metaTexts.find((t) => !/\d/.test(t)) ?? parentLocation;
              const title = visibleText(roleNode);
              results.push({ title, company: companyName, dateRange, location });
            });
            return;
          }

          const title = visibleText(bolds[0] || null);
          const company = visibleText(item.querySelector(".t-normal"));
          const metaTexts = Array.from(item.querySelectorAll(".t-black--light"))
            .map((m) => visibleText(m))
            .filter(Boolean);
          const dateRange = metaTexts.find((t) => /\d/.test(t)) ?? metaTexts[metaTexts.length - 1] ?? "";
          const location = metaTexts.find((t) => !/\d/.test(t)) ?? metaTexts[0] ?? "";
          results.push({ title, company, dateRange, location });
        });
        return results;
      });
    })();

    const education = await (async () => {
      const seeAllEdu = await page.$("#navigation-index-see-all-education");
      if (seeAllEdu) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null),
          seeAllEdu.click(),
        ]);

        await page
          .waitForSelector("main div[data-view-name='profile-component-entity']", { timeout: 15000 })
          .catch(() => null);

        const expanded = await page.$$eval("main div[data-view-name='profile-component-entity']", (items) => {
          return items.map((item) => {
            const { visibleText } = window.puppeteer;
            const school = visibleText(item.querySelector(".t-bold"));
            const degree = visibleText(item.querySelector(".t-normal"));
            const dateRange = visibleText(item.querySelector(".t-black--light"));
            return { school, degree, dateRange };
          });
        });

        const backBtn = await page.$('button[aria-label="Back to the main profile page"]');
        if (backBtn) {
          await Promise.all([
            page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null),
            backBtn.click(),
          ]);
        } else {
          await page.goBack({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null);
        }
        await page.waitForSelector("main", { timeout: 15000 }).catch(() => null);

        return expanded;
      }

      return await page.$$eval("main .artdeco-card.pv-profile-card", (cards) => {
        const eduCard = cards.find((card) => card.querySelector("#education"));
        if (!eduCard) return [] as any[];
        const items = Array.from(eduCard.querySelectorAll("div[data-view-name='profile-component-entity']"));
        return items.map((item) => {
          const { visibleText } = window.puppeteer;
          const school = visibleText(item.querySelector(".t-bold"));
          const degree = visibleText(item.querySelector(".t-normal"));
          const dateRange = visibleText(item.querySelector(".t-black--light"));
          return {
            school,
            degree,
            dateRange,
          };
        });
      });
    })();

    const cleanedExperiences = (() => {
      const EMPLOYMENT_TYPES = /(full[- ]?time|part[- ]?time|intern(ship)?|contract|freelance)/i;
      const MONTH_TOKENS = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ];

      const isDurationLike = (val?: string | null) => {
        if (!val) return false;
        const lower = val.toLowerCase();
        if (/\d/.test(lower) && /(yr|year|mo|month|\d\s*(yrs?|mos?))/i.test(lower)) return true;
        return MONTH_TOKENS.some((m) => lower.includes(m));
      };

      const normalizeField = (val: string | null | undefined, expectDuration: boolean) => {
        if (!val) return null;
        const isDur = isDurationLike(val);
        if (expectDuration && !isDur) return null;
        if (!expectDuration && isDur) return null;
        return val;
      };

      const seen = new Map<string, Experience>();

      experiences.forEach((exp) => {
        const key = `${exp.title}::${exp.company}`;
        // Drop employment-type companies when a real company exists for same title
        if (EMPLOYMENT_TYPES.test(exp.company)) {
          const nonType = Array.from(seen.values()).find(
            (e) => e.title === exp.title && !EMPLOYMENT_TYPES.test(e.company)
          );
          if (nonType) return;
        }

        const cleaned: Experience = {
          title: exp.title,
          company: normalizeField(exp.company, false),
          dateRange: normalizeField(exp.dateRange, true),
          location: normalizeField(exp.location, false),
        };

        seen.set(key, cleaned);
      });

      return Array.from(seen.values());
    })();

    return {
      name: textOrNull(name),
      headline: textOrNull(headline),
      location: textOrNull(location),
      followers: textOrNull(followers),
      about: textOrNull(about),
      experiences: cleanedExperiences,
      education,
    };
  }
}
