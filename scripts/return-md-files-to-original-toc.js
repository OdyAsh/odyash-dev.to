/*
return-md-files-to-original-toc.js
----------------------------------
This script restores the original Table of Contents (TOC) in markdown files after dev.to publication.

Code Flow:
1. Reads the list of markdown files from dev-to-git.json. Example input:
   [
     { "relativePathToArticle": "./the-blog-posts/vibe-coding/01-surviving-the-vibe-coding-trend.md" }
   ]
2. For each file:
   a. Checks for a backup file: <file>-original-toc.md
   b. If found, overwrites <file>.md with the backup and deletes the backup file.
   c. Logs the restoration process.

This script is used in the CI pipeline after publishing to dev.to, ensuring local files are restored to their original state.

Example:
- Before restore: TOC in <file>.md is dev.to-compatible.
- After restore: TOC in <file>.md is exactly as it was before conversion.
*/

const fs = require('fs');
const path = require('path');
const devToGitJson = require('../dev-to-git.json');

function getMdFiles() {
  const files = devToGitJson.map(entry => path.resolve(__dirname, '..', entry.relativePathToArticle));
  console.log('[return-original-toc] Markdown files to restore:', files);
  return files;
}

function restoreOriginalToc(mdFile) {
  const backupFile = mdFile.replace(/\.md$/, '-original-toc.md');
  if (fs.existsSync(backupFile)) {
    fs.copyFileSync(backupFile, mdFile);
    fs.unlinkSync(backupFile);
    console.log(`[return-original-toc] Restored ${mdFile} from ${backupFile}`);
  } else {
    console.log(`[return-original-toc] No backup found for ${mdFile}`);
  }
}

function main() {
  const mdFiles = getMdFiles();
  mdFiles.forEach(restoreOriginalToc);
  console.log('[return-original-toc] All files processed.');
}

main();
