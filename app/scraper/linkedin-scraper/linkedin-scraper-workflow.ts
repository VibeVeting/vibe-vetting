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

      const results: Array<ProfileSummary & { profileUrl: string; error?: string }> = [];
      for (const profileUrl of profileUrls) {
        try {
          console.log(`Processing profile: ${profileUrl}`);
          const profileData = await this.profileExtractionService.extractProfile(page, profileUrl);
          
          if (profileData.error) {
            console.log(`Skipping invalid profile: ${profileUrl} - ${profileData.error}`);
          }
          
          onProfileScraped(profileUrl, profileData);
          results.push({ profileUrl, ...profileData });
        } catch (error) {
          console.error(`Failed to scrape profile ${profileUrl}:`, error);
          const errorData = {
            name: null,
            headline: null,
            location: null,
            followers: null,
            about: null,
            experiences: [],
            education: [],
            error: `Failed to scrape: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
          onProfileScraped(profileUrl, errorData);
          results.push({ profileUrl, ...errorData });
        }
      }

      return results;
    } finally {
      await closeSession();
    }
  }
}
