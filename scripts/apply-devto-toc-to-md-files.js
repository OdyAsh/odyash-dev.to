/*
apply-devto-toc-to-md-files.js
------------------------------
This script automates the process of preparing markdown files for dev.to publication by updating their Table of Contents (TOC) links to be dev.to-compatible.

Code Flow:
1. Reads the list of markdown files from dev-to-git.json. Example input:
   [
     { "relativePathToArticle": "./the-blog-posts/vibe-coding/01-surviving-the-vibe-coding-trend.md" }
   ]
2. For each file:
   a. Creates a backup: <file>.md → <file>-original-toc.md
   b. Reads the markdown file and passes its content to the TOC converter (markdown-toc-to-devto-toc.js).
   c. Overwrites the original .md file with the dev.to-compatible TOC.
3. Logs each step for transparency.

This script is used in the CI pipeline before publishing to dev.to, ensuring all TOCs are compatible with dev.to anchor rules.

Example:
- Input TOC:
  - [First - Strategic Thinking (`lvl1`)](#first---strategic-thinking-lvl1)
- Output TOC:
  - [First - Strategic Thinking (`lvl1`)](#first-strategic-thinking-raw-lvl1-endraw-)
  (Note: The URI part now uses -raw-lvl1-endraw- for backtick content, and double hyphens are collapsed to one.)
*/

const fs = require('fs');
const path = require('path');

const devToGitJson = require('../dev-to-git.json');
const tocConverter = require('./markdown-toc-to-devto-toc');

function getMdFiles() {
  const files = devToGitJson.map(entry => path.resolve(__dirname, '..', entry.relativePathToArticle));
  console.log('[apply-devto-toc] Markdown files to process:', files);
  return files;
}

function copyOriginalToc(mdFile) {
  const backupFile = mdFile.replace(/\.md$/, '-original-toc.md');
  fs.copyFileSync(mdFile, backupFile);
  console.log(`[apply-devto-toc] Backed up ${mdFile} to ${backupFile}`);
}

function applyDevtoToc(mdFile) {
  const content = fs.readFileSync(mdFile, 'utf8');
  const newContent = tocConverter(content);
  fs.writeFileSync(mdFile, newContent, 'utf8');
  console.log(`[apply-devto-toc] Applied dev.to TOC conversion to ${mdFile}`);
}

function main() {
  const mdFiles = getMdFiles();
  mdFiles.forEach(copyOriginalToc);
  mdFiles.forEach(applyDevtoToc);
  console.log('[apply-devto-toc] All files processed.');
}

main();
