import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";

const CONFIG = {
  githubUsername: "gamer69a",
  baseName: "xskullx-auto",
  historyFile: "history.json",
  batchCount: 3 // Creates 3 new instances per run
};

let history = [];
if (fs.existsSync(CONFIG.historyFile)) {
  try {
    history = JSON.parse(fs.readFileSync(CONFIG.historyFile, "utf8"));
  } catch (e) {
    history = [];
  }
}

async function runAutomation() {
  const timestamp = new Date().toLocaleString();
  console.log(`🚀 Running automated batch at ${timestamp}...`);

  // Generate 3 instances per run and accumulate them
  for (let k = 0; k < CONFIG.batchCount; k++) {
    const newRunNumber = history.length + 1;
    const name = `${CONFIG.baseName}-${newRunNumber}`;
    const npmPackageName = `${name}-pkg`;

    try {
      execSync(`npm pkg set name="${npmPackageName}"`, { stdio: "ignore" });
      execSync(`npm publish --access public`, { stdio: "ignore" });
    } catch (e) {}

    let githubUrl = "";
    try {
      githubUrl = execSync("git config --get remote.origin.url", { encoding: "utf8" }).trim();
      githubUrl = githubUrl.replace(/\.git$/, "").replace("git@github.com:", "https://github.com/");
    } catch (e) {
      githubUrl = `https://github.com/${CONFIG.githubUsername}/${name}`;
    }

    const currentInstance = {
      name,
      vercelUrl: `https://${name}.vercel.app`,
      githubUrl,
      npmUrl: `https://www.npmjs.com/package/${npmPackageName}`,
      autoUpdatingUnpkg: `https://unpkg.com/${npmPackageName}/index.html`,
      autoUpdatingJsdelivr: `https://cdn.jsdelivr.net/npm/${npmPackageName}/index.html`,
      jsdelivrGithub: `https://cdn.jsdelivr.net/gh/${CONFIG.githubUsername}/${name}@main/index.html`,
      jsdelivrCommit: `https://cdn.jsdelivr.net/gh/${CONFIG.githubUsername}/${name}@HEAD/index.html`,
      rawgitHack: `https://rawgit.hack.workers.dev/${CONFIG.githubUsername}/${name}/main/index.html`,
      htmlPreview: `https://htmlpreview.github.io/?https://github.com/${CONFIG.githubUsername}/${name}/blob/main/index.html`,
      skypackEsm: `https://cdn.skypack.dev/${npmPackageName}`,
      timestamp
    };

    history.push(currentInstance);
  }

  // Save history state
  fs.writeFileSync(CONFIG.historyFile, JSON.stringify(history, null, 2));

  // Build document with total cumulative history
  const docSections = [
    new Paragraph({ text: `Automated CDN Links Log (Total Runs: ${history.length})`, heading: HeadingLevel.HEADING_1 })
  ];

  for (const item of history) {
    docSections.push(
      new Paragraph({ text: `Instance: ${item.name} (${item.timestamp})`, heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: "=== SOURCE PLATFORMS ===", bold: true }),
      new Paragraph({ text: `Vercel URL: ${item.vercelUrl}` }),
      new Paragraph({ text: `GitHub Repo: ${item.githubUrl}` }),
      new Paragraph({ text: `npm Registry: ${item.npmUrl}` }),
      new Paragraph({ text: "" }),
      new Paragraph({ text: "=== AUTO-UPDATING CDN LINKS (ALWAYS LATEST) ===", bold: true }),
      new Paragraph({ text: `UNPKG Latest: ${item.autoUpdatingUnpkg}` }),
      new Paragraph({ text: `jsDelivr Latest: ${item.autoUpdatingJsdelivr}` }),
      new Paragraph({ text: "" }),
      new Paragraph({ text: "=== PINNED VERSION ARCHIVE ===", bold: true }),
      new Paragraph({ text: `jsDelivr (GitHub): ${item.jsdelivrGithub}` }),
      new Paragraph({ text: `jsDelivr (Commit Hash): ${item.jsdelivrCommit}` }),
      new Paragraph({ text: `rawgit.hack: ${item.rawgitHack}` }),
      new Paragraph({ text: `HTMLPreview: ${item.htmlPreview}` }),
      new Paragraph({ text: `Skypack (ESM): ${item.skypackEsm}` }),
      new Paragraph({ text: "" })
    );
  }

  const doc = new Document({ sections: [{ children: docSections }] });
  const buffer = await Packer.toBuffer(doc);

  // Save local copy (GitHub Actions will commit this file automatically)
  fs.writeFileSync("Generated_CDN_Links.docx", buffer);

  // Attempt OneDrive save only if running locally on your Mac
  try {
    const onedriveFolder = path.join(os.homedir(), "Library/CloudStorage/OneDrive-Personal");
    if (fs.existsSync(onedriveFolder)) {
      const outputPath = path.join(onedriveFolder, "Generated_CDN_Links.docx");
      fs.writeFileSync(outputPath, buffer);
    }
  } catch (e) {
    // Silently ignore OneDrive path error when running in cloud
  }

  console.log(`✅ Accumulated ${history.length} instances successfully!`);
}

runAutomation();