import { PuppeteerHelpersType } from "@/lib/browser/helpers";

export type NullableString = string | null | undefined;

declare global {
  interface Window {
    puppeteer: PuppeteerHelpersType;
  }
}
