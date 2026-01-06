import fs from "fs";
import path from "path";
import ts from "typescript";

import * as constants from "./constants";

const puppeteerHelpers = {
  ...constants,
};

export type PuppeteerHelpersType = typeof puppeteerHelpers;

const HELPER_EXPORTS = Object.keys(puppeteerHelpers);

/**
 * Build the helpers bundle by reading raw TypeScript source files
 * and compiling them. This avoids minification issues where
 * function.toString() breaks due to renamed internal references.
 */
function buildHelpersBundle(): string {
  const browserDir = path.join(process.cwd(), "lib", "browser");

  const sourceFiles = [
    path.join(browserDir, "constants.ts"),
  ];

  let combinedSource = "";

  for (const filePath of sourceFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    // Remove export/import keywords so functions become local declarations
    const cleaned = content
      .replace(/^export\s+/gm, "")
      .replace(/^import\s+.*$/gm, "");
    combinedSource += cleaned + "\n";
  }

  // Compile TypeScript to JavaScript
  const result = ts.transpileModule(combinedSource, {
    compilerOptions: {
      module: ts.ModuleKind.None,
      target: ts.ScriptTarget.ES2020,
      removeComments: true,
    },
  });

  // Generate exports to window.puppeteer
  const exports = HELPER_EXPORTS.map(
    (name) => `window.puppeteer.${name} = ${name};`,
  ).join("\n");

  return `
    (function(){
      try {
        window.puppeteer = window.puppeteer || {};
        ${result.outputText}
        ${exports}
        console.log('✅ Puppeteer helpers injected');
      } catch (e) {
        console.error('❌ Failed to inject puppeteer helpers:', e);
      }
    })();
  `;
}

// Cache the bundle so we only build once per server instance
let cachedBundle: string | null = null;

/**
 * Get the injection script for puppeteer helpers.
 * Builds and caches the bundle on first call.
 */
export function getInjectionScript(): string {
  if (!cachedBundle) {
    cachedBundle = buildHelpersBundle();
  }
  return cachedBundle;
}
