const next = require("next");
const http = require("http");

const app = next({ dev: true });
const handle = app.getRequestHandler();

(async () => {
  await app.prepare();

  const PORT = 8080;
  const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  await new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`Next.js dev server ready on ${PORT}`);
      resolve();
    });
  });

  try {
    const res = await fetch(`${APP_URL}/scraper/linkedin-scraper/scrape-profiles`);
    const json = await res.json();
    console.log(json);
  } catch (err) {
    console.error(err);
  } finally {
    server.close();
  }
})();
