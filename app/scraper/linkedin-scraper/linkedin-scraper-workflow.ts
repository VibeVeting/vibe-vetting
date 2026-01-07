import { createBrowserSession } from "@/lib/browser/browser-session";
import { LinkedinLoginService } from "./services/linkedin-login-service";
import { LinkedinProfileExtractionService, type ProfileSummary } from "./services/linkedin-profile-extraction-service";

export class LinkedinScraperWorkflow {
  private loginService: LinkedinLoginService;
  private profileExtractionService: LinkedinProfileExtractionService;

  constructor() {
    this.loginService = new LinkedinLoginService();
    this.profileExtractionService = new LinkedinProfileExtractionService();
  }

  async scrapeProfiles(
    profileUrls: string[] = [],
    onProfileScraped: (profileUrl: string, data: ProfileSummary) => void = () => {}
  ): Promise<Array<ProfileSummary & { profileUrl: string }>> {
    if (!profileUrls.length) return [];

    const { page, closeSession } = await createBrowserSession("https://www.linkedin.com/feed/");

    try {
      await this.loginService.loginWithCookies(page);

      const results: Array<ProfileSummary & { profileUrl: string }> = [];
      for (const profileUrl of profileUrls) {
        const profileData = await this.profileExtractionService.extractProfile(page, profileUrl);
        onProfileScraped(profileUrl, profileData);
        results.push({ profileUrl, ...profileData });
      }

      return results;
    } finally {
      await closeSession();
    }
  }
}
