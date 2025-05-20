/**
 * MERMAID TO PNG CONVERTER
 * 
 * This script processes Markdown files containing Mermaid diagram code blocks,
 * converts them to PNG images, and updates the markdown with image references.
 * 
 * Logical Flow:
 * 1. Read the markdown file content
 * 2. Create 'mermaid/' and 'assets/' directories next to the markdown file
 * 3. Extract all Mermaid code blocks from the markdown
 * 4. For each Mermaid diagram:
 *    - Save the Mermaid code to a .mmd file in the 'mermaid/' directory
 *    - Render the diagram using Puppeteer's headless browser
 *    - Save the rendered diagram as a PNG in the 'assets/' directory
 * 5. Replace all Mermaid code blocks in the markdown with image references
 * 6. Save the updated markdown file
 * 
 * Special Behaviors: 
 * - File Naming: The script checks the first 5 lines of each mermaid code block
 *   for a pattern "%% file name: xxxx" (even if indented). If found, the text after
 *   the prefix is used as the filename (with any '.mmd' or '.mermaid' extension removed and the
 *   name sanitized for file system compatibility). For example, if a line contains
 *   "    %% file name: ai vibe brain diagram.mmd", the filename will be "ai vibe brain diagram".
 *   Spaces within filenames are preserved, while invalid characters are replaced with hyphens.
 *   If no such pattern is found, sequential names like 'mermaid-1', 'mermaid-2', etc. are used.
 *   The script also handles special cases like removing consecutive hyphens and trimming
 *   leading/trailing whitespace and hyphens from the generated filenames.
 * - Directory Structure: All assets and mermaid files are created in dedicated folders
 *   next to the markdown file, not in the root directory. This keeps diagram assets
 *   organized with their source content.
 * - Existing Files: If a .mmd file already exists, its content is overwritten with
 *   the current mermaid code. PNG files are always regenerated to ensure they reflect
 *   the current mermaid code.
 * - Image References: The script updates markdown to use relative path references
 *   to the generated PNG files, making it compatible with both local viewing and
 *   publishing platforms.
 * 
 * Usage: node mermaid-to-png.js <markdown-file-path>
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * Extract and process Mermaid diagrams from a Markdown file using Puppeteer
 * @param {string} mdFilePath - Path to the Markdown file
 * @returns {Promise<number>} - Number of diagrams processed
 */
async function processMermaidDiagrams(mdFilePath) {
  // Read the markdown file
  const mdContent = fs.readFileSync(mdFilePath, 'utf8');
  
  // Directory setup
  const mdDir = path.dirname(mdFilePath);
  const mermaidDir = path.join(mdDir, 'mermaid');
  const assetsDir = path.join(mdDir, 'assets');
  
  console.log(`Processing file: ${mdFilePath}`);
  console.log(`Creating directories (if needed):`);
  console.log(`- Mermaid dir: ${mermaidDir}`);
  console.log(`- Assets dir: ${assetsDir}`);
  
  // Create directories if they don't exist
  if (!fs.existsSync(mermaidDir)) {
    fs.mkdirSync(mermaidDir, { recursive: true });
    console.log(`Created directory: ${mermaidDir}`);
  }
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log(`Created directory: ${assetsDir}`);
  }
  
  // Find all mermaid code blocks
  const mermaidRegex = /```\s*mermaid\s*\r?\n([\s\S]*?)\r?\n\s*```/g;
  let match;
  let counter = 1;
  let fileChanges = [];
  let modifiedMdContent = mdContent;
  
  console.log(`Searching for mermaid code blocks...`);

  // Store all matches in an array first
  const matches = [];
  while ((match = mermaidRegex.exec(mdContent)) !== null) {
    matches.push({
      fullMatch: match[0],
      code: match[1]
    });
  }

  if (matches.length === 0) {
    console.log('No mermaid diagrams found');
    return 0;
  }

  console.log(`Found ${matches.length} mermaid diagrams`);
  
  try {
    // Launch browser once for all diagrams
    const browser = await puppeteer.launch({ 
      headless: 'new'
    });

    for (const match of matches) {
      const mermaidCode = match.code;
      const fullMatch = match.fullMatch;
        // Check for filename in first 5 lines (looking for "%% file name: " pattern)
      const lines = mermaidCode.split('\n').slice(0, 5);
      let fileName;
      let fileNameFound = false;
        // Look for filename pattern in first 5 lines
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.toLowerCase().startsWith('%% file name:')) {
          // Extract filename, remove .mmd or .mermaid extension if present
          let extractedName = trimmedLine.substring(12).trim();
          if (extractedName.toLowerCase().endsWith('.mmd')) {
            extractedName = extractedName.substring(0, extractedName.length - 4);
          } else if (extractedName.toLowerCase().endsWith('.mermaid')) {
            extractedName = extractedName.substring(0, extractedName.length - 9);
          }
            // Remove special characters that aren't valid in filenames, but preserve whitespace in the middle
          // First, replace any special chars (except spaces) with hyphens
          fileName = extractedName.replace(/[^a-zA-Z0-9-_ ]/g, '-');
          
          // Replace consecutive hyphens with a single hyphen
          fileName = fileName.replace(/--+/g, '-');
          
          // Remove any leading or trailing hyphens and spaces
          fileName = fileName.replace(/^[-\s]+|[-\s]+$/g, '');
          
          fileNameFound = true;
          break;
        }
      }
      
      // If no filename found, use default naming
      if (!fileNameFound) {
        fileName = `mermaid-${counter}`;
        counter++;
      }
      
      const mmdFilePath = path.join(mermaidDir, `${fileName}.mmd`);
      const pngFilePath = path.join(assetsDir, `${fileName}.png`);
      const relativePngPath = path.relative(mdDir, pngFilePath).replace(/\\/g, '/');
      
      // Always save/overwrite mermaid code to .mmd file
      fs.writeFileSync(mmdFilePath, mermaidCode);
      console.log(`${fs.existsSync(mmdFilePath) ? 'Updated' : 'Created'} ${mmdFilePath}`);
      
      // Always generate PNG (even if .mmd exists) to ensure it's up to date
      console.log(`Generating PNG for ${fileName}...`);
      
      // Create a new page
      const page = await browser.newPage();
      
      // Load mermaid renderer
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
          <style>
            body { margin: 0; padding: 10px; }
            .mermaid { display: inline-block; }
          </style>
        </head>
        <body>
          <div class="mermaid">
            ${mermaidCode}
          </div>
          <script>
            mermaid.initialize({
              startOnLoad: true,
              theme: 'default'
            });
          </script>
        </body>
        </html>
      `;
      
      await page.setContent(html);
      
      // Wait for mermaid to render
      await page.waitForSelector('.mermaid svg');
      
      // Take screenshot of the diagram
      const element = await page.$('.mermaid');
      await element.screenshot({
        path: pngFilePath,
        omitBackground: true
      });
      
      console.log(`Generated ${pngFilePath}`);
      
      // Add to changes list
      const imageMarkdown = `![${fileName}](${relativePngPath})`;
      fileChanges.push({
        original: fullMatch,
        replacement: imageMarkdown
      });
      
      await page.close();
    }
    
    // Close the browser
    await browser.close();

    // Apply all replacements to the markdown content
    for (const change of fileChanges) {
      modifiedMdContent = modifiedMdContent.replace(change.original, change.replacement);
    }
    
    // Write the modified content back if there were changes
    if (modifiedMdContent !== mdContent) {
      fs.writeFileSync(mdFilePath, modifiedMdContent);
      console.log(`Updated ${mdFilePath} with ${fileChanges.length} image references`);
    }
    
    return fileChanges.length;
  } catch (err) {
    console.error('Error processing mermaid diagrams:', err);
    return 0;
  }
}

/**
 * Main function to be called from command line
 */
async function main() {
  const mdFilePath = process.argv[2];
  
  if (!mdFilePath) {
    console.error('Please provide a markdown file path');
    process.exit(1);
  }
  
  if (!fs.existsSync(mdFilePath)) {
    console.error(`File not found: ${mdFilePath}`);
    process.exit(1);
  }
  
  try {
    const changesCount = await processMermaidDiagrams(mdFilePath);
    console.log(`Processed ${changesCount} Mermaid diagrams`);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

// If called directly via command line
if (require.main === module) {
  main();
}

module.exports = { processMermaidDiagrams };
