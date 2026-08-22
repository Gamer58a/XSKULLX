import { Octokit } from "octokit";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";

const CONFIG = {
  githubUsername: "gamer69a",
  baseName: "xskullx-auto",
  count: 3
};

async function runAutomation() {
  console.log("🚀 Starting automated deployment pipeline...");
  const docSections = [];

  for (let i = 1; i <= CONFIG.count; i++) {
    const name = `${CONFIG.baseName}-${i}`;
    const npmPackageName = `${name}-pkg`;

    // 1. Publish npm package silently
    try {
      execSync(`npm pkg set name="${npmPackageName}"`, { stdio: "ignore" });
      execSync(`npm publish --access public`, { stdio: "ignore" });
    } catch (e) {
      // Prevents execution crash if package version is already published
    }

    // 2. Automatically resolve GitHub repository URL
    let githubUrl = "";
    try {
      githubUrl = execSync("git config --get remote.origin.url", { encoding: "utf8" }).trim();
      githubUrl = githubUrl.replace(/\.git$/, "").replace("git@github.com:", "https://github.com/");
    } catch (e) {
      githubUrl = `https://github.com/${CONFIG.githubUsername}/${name}`;
    }

    // 3. Define target URLs
    const vercelUrl = `https://${name}.vercel.app`;
    const npmUrl = `https://www.npmjs.com/package/${npmPackageName}`;
    const autoUpdatingUnpkg = `https://unpkg.com/${npmPackageName}/index.html`;
    const autoUpdatingJsdelivr = `https://cdn.jsdelivr.net/npm/${npmPackageName}/index.html`;

    // 4. Construct Document Lines
    docSections.push(
      new Paragraph({ text: `Instance: ${name}`, heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: "=== SOURCE PLATFORMS ===", bold: true }),
      new Paragraph({ text: `Vercel URL: ${vercelUrl}` }),
      new Paragraph({ text: `GitHub Repo: ${githubUrl}` }),
      new Paragraph({ text: `npm Registry: ${npmUrl}` }),
      new Paragraph({ text: "" }),
      new Paragraph({ text: "=== AUTO-UPDATING CDN LINKS (ALWAYS LATEST) ===", bold: true }),
      new Paragraph({ text: `UNPKG Latest: ${autoUpdatingUnpkg}` }),
      new Paragraph({ text: `jsDelivr Latest: ${autoUpdatingJsdelivr}` }),
      new Paragraph({ text: "" }),
      new Paragraph({ text: "=== PINNED VERSION ARCHIVE ===", bold: true }),
      new Paragraph({ text: `jsDelivr (GitHub): https://cdn.jsdelivr.net/gh/${CONFIG.githubUsername}/${name}@main/index.html` }),
      new Paragraph({ text: `jsDelivr (Commit Hash): https://cdn.jsdelivr.net/gh/${CONFIG.githubUsername}/${name}@HEAD/index.html` }),
      new Paragraph({ text: `rawgit.hack: https://rawgit.hack.workers.dev/${CONFIG.githubUsername}/${name}/main/index.html` }),
      new Paragraph({ text: `HTMLPreview: https://htmlpreview.github.io/?https://github.com/${CONFIG.githubUsername}/${name}/blob/main/index.html` }),
      new Paragraph({ text: `Skypack (ESM): https://cdn.skypack.dev/${npmPackageName}` }),
      new Paragraph({ text: "" })
    );
  }

  // 5. Build and Save Document
  const doc = new Document({
    sections: [{ children: docSections }]
  });

  const buffer = await Packer.toBuffer(doc);
  
  // Save local copy
  fs.writeFileSync("Generated_CDN_Links.docx", buffer);
  console.log("✅ Saved CDN links to Generated_CDN_Links.docx");

  // Save directly to OneDrive cloud folder
  const onedriveFolder = path.join(os.homedir(), "Library/CloudStorage/OneDrive-Personal");
  const outputPath = path.join(onedriveFolder, "Generated_CDN_Links.docx");

  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ File saved to OneDrive: ${outputPath}`);
}

runAutomation();