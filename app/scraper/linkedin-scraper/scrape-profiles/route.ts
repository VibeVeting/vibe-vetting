import { NextResponse } from "next/server";
import { LinkedinScraperWorkflow } from "../linkedin-scraper-workflow";

const profileUrls = [
  "https://www.linkedin.com/in/luraelumpkin/",
  "https://www.linkedin.com/in/abdulaziz-halabi-46379a398/",
  "https://www.linkedin.com/in/georgiajuwono/",
  "https://www.linkedin.com/in/sidney-lam/",
  "https://www.linkedin.com/in/vinay-prajapati-076/",
  "https://www.linkedin.com/in/itzsunny/",
  // Add more profile URLs as needed
];

export async function GET(request: Request) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
    }

    const scrapeLinkedinProfiles = async () => {
      const workflow = new LinkedinScraperWorkflow();
      workflow.scrapeProfiles(profileUrls, (url, data) => {
        console.log(`Scraped profile: ${url}`);
        console.log(data);
      });
    };

    scrapeLinkedinProfiles();

    return NextResponse.json({ message: "Process started" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: { message: "Internal Server Error" } }, { status: 500 });
  }
}
