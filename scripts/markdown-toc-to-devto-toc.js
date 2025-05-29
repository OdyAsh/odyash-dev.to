/*
markdown-toc-to-devto-toc.js
----------------------------
This module exports a function that takes the content of a markdown file and rewrites its Table of Contents (TOC) links to be compatible with dev.to's anchor format.

Code Flow:
1. Locates the TOC block in the markdown (start: line containing 'TOC' or 'table of content(s)', end: first line after that which does not match a markdown link pattern). Allows for any number of blank lines after the header, and preserves them after conversion.
2. Removes emoji/invisible characters (non-alphanumerics except #, spaces, hyphens, brackets, etc.) from the TOC block before processing links.
3. For each TOC entry:
   a. Replaces 2 or more consecutive hyphens in the URI with a single hyphen.
   b. If the alt text contains backticks (e.g. `lvl1`), replaces the corresponding part in the URI with -raw-lvl1-endraw- (ensuring no double hyphens and correct placement).
   c. Ensures -raw- and -endraw- are always surrounded by hyphens and not stripped from the start/end of the URI.
4. Returns the markdown content with the updated TOC block, preserving original blank lines after the header.
5. Logs each conversion for clarity.

Example:
- Input: [First - Strategic Thinking (`lvl1`)](#first---strategic-thinking-lvl1)
- Output: [First - Strategic Thinking (`lvl1`)](#first-strategic-thinking-raw-lvl1-endraw-)
*/

// This module exports a function that takes the markdown content and returns the content with the TOC converted to dev.to-compatible format.

function convertTocLinks(tocBlock) {
    // Replace 2+ consecutive hyphens in URIs with 1, and handle backtick content in the alt text by updating the URI
    console.log('[markdown-toc-to-devto-toc] Converting TOC block...');
    const result = tocBlock.replace(/\[(.*?)\]\((#.*?)\)/g, (match, alt, uri) => {
        // We only care about the URI part for dev.to anchors, not the alt text
        let newUri = uri;
        // Remove emoji/invisible characters (non-alphanumerics except #, spaces, hyphens, and brackets)
        newUri = newUri.replace(/[^\w\s#\-\[\]\(\)`"',.]/gu, '');
        // If the alt text contains backticks, insert -raw-...-endraw- in the URI at the corresponding place
        // Find all backtick-surrounded segments in the alt text
        const backtickRegex = /`([^`]+)`/g;
        let m;
        while ((m = backtickRegex.exec(alt)) !== null) {
            // Replace the corresponding part in the URI with -raw-...-endraw-
            // Find the text (without backticks) in the URI and replace it
            const rawText = m[1];
            // Replace all occurrences of the rawText in the URI with -raw-rawText-endraw-
            newUri = newUri.replace(new RegExp(rawText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `-raw-${rawText}-endraw-`);
        }
        // Collapse 2+ hyphens to 1
        newUri = newUri.replace(/-+/g, '-');
        newUri = '#' + newUri.replace(/^#/, ''); // Ensure it starts with #
        if (uri !== newUri) {
            console.log(`[markdown-toc-to-devto-toc] Converted: [${alt}](${uri}) => [${alt}](${newUri})`);
        }
        return `[${alt}](${newUri})`;
    });
    return result;
}

function findAndReplaceToc(content) {
    // New logic: Find TOC block by header containing 'TOC' or 'table of content(s)', then lines with markdown links
    const lines = content.split(/\r?\n/);
    let tocStart = -1;
    let tocEnd = -1;
    // Regex for TOC header
    const tocHeaderRegex = /toc|table of content(s)?/i;
    // Regex for markdown link line (allowing -, *, +, or numbered list as prefix)
    const tocLinkRegex = /^\s*(?:[-*+]|\d+\.)?\s*\[.*?\]\(.*?\)/;

    // Find start of TOC
    for (let i = 0; i < lines.length; i++) {
        if (tocHeaderRegex.test(lines[i])) {
            tocStart = i;
            break;
        }
    }
    if (tocStart === -1) {
        console.log('[markdown-toc-to-devto-toc] No TOC header found.');
        return content;
    }
    // Count blank lines after TOC header
    let blankLineCount = 1; // Start with 1 as we assume there's at least one blank line after the header
    let scan = tocStart + 1;
    while (scan < lines.length && lines[scan].trim() === '') {
        blankLineCount++;
        scan++;
    }
    // Find end of TOC block
    tocEnd = scan;
    while (tocEnd < lines.length && tocLinkRegex.test(lines[tocEnd])) {
        tocEnd++;
    }
    // Extract and convert TOC block
    const tocBlockLines = lines.slice(scan, tocEnd);
    const tocBlock = tocBlockLines.join('\n');
    console.log('[markdown-toc-to-devto-toc] Found TOC block.');
    console.log('[markdown-toc-to-devto-toc] ############### TOC START ###############');
    console.log(tocBlock);
    console.log('[markdown-toc-to-devto-toc] ############### TOC END ###############');
    const converted = convertTocLinks(tocBlock);
    // Replace in content, preserving the same number of blank lines after the TOC header
    const before = lines.slice(0, tocStart + 1).join('\n') + '\n'.repeat(blankLineCount);
    const after = lines.slice(tocEnd).join('\n');
    return before + converted + (converted ? '\n' : '') + after;
}

module.exports = findAndReplaceToc;
