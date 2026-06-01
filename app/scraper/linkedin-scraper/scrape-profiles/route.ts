import { NextResponse } from "next/server";
import { LinkedinScraperWorkflow } from "../linkedin-scraper-workflow";
import * as fs from "fs";
import * as path from "path";

const profileUrls: string[] = [];

// Output file path for all scraped profiles
const OUTPUT_FILE = path.join(process.cwd(), "scraper-output", "linkedin", "all-profiles.json");

// Helper function to save profile to file
function saveProfilesToFile(profiles: any[]) {
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Load existing profiles if file exists
    let allProfiles: any[] = [];
    if (fs.existsSync(OUTPUT_FILE)) {
      try {
        const existingData = fs.readFileSync(OUTPUT_FILE, "utf-8");
        allProfiles = JSON.parse(existingData);
      } catch (e) {
        console.log("Starting with fresh profiles file");
        allProfiles = [];
      }
    }

    // Merge profiles (update existing or add new based on profileUrl)
    for (const profile of profiles) {
      const existingIndex = allProfiles.findIndex((p) => p.profileUrl === profile.profileUrl);
      if (existingIndex >= 0) {
        allProfiles[existingIndex] = profile;
      } else {
        allProfiles.push(profile);
      }
    }

    // Save to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProfiles, null, 2), "utf-8");
    console.log(`Profiles saved to: ${OUTPUT_FILE}`);
    console.log(`Total profiles in file: ${allProfiles.length}`);
  } catch (error) {
    console.error("Error saving profiles to file:", error);
  }
}

export async function GET(request: Request) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
    }

    const scrapeLinkedinProfiles = async () => {
      const workflow = new LinkedinScraperWorkflow();
      const scrapedProfiles: any[] = [];

      await workflow.scrapeProfiles(profileUrls, (url, data) => {
        console.log(`Scraped profile: ${url}`);
        console.log(data);
        
        // Add to scraped profiles array with timestamp
        scrapedProfiles.push({
          profileUrl: url,
          ...data,
          scrapedAt: new Date().toISOString(),
        });

        // Save after each profile (incremental save)
        saveProfilesToFile(scrapedProfiles);
      });

      console.log(`Scraping complete. Total profiles scraped: ${scrapedProfiles.length}`);
    };

    scrapeLinkedinProfiles();

    return NextResponse.json({ message: "Process started" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: { message: "Internal Server Error" } }, { status: 500 });
  }
}
