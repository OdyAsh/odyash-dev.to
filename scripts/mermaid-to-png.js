/**
 * MERMAID TO PNG CONVERTER (using mermaid-cli)
 * 
 * This script processes Markdown files containing Mermaid diagram code blocks,
 * converts them to PNG images using mmdc, and updates the markdown with image references.
 * 
 * Logical Flow:
 * 1. Read the markdown file content
 * 2. Create 'mermaid/' and 'assets/' directories next to the markdown file
 * 3. Extract all Mermaid code blocks from the markdown
 * 4. For each Mermaid diagram:
 *    - Save the Mermaid code to a .mmd file in the 'mermaid/' directory
 *    - Render the diagram using mermaid-cli
 *    - Save the rendered diagram as a PNG in the 'assets/' directory
 * 5. Replace all Mermaid code blocks in the markdown with image references
 * 6. Save the updated markdown file
 * 
 * Special Behaviors: 
 * - Command Arguments: The script checks the first 5 lines of each mermaid code block
 *   for command-line style arguments (e.g., `%% -o my-diagram` or `%% -w 800`).
 *   These are passed directly to the mmdc command.
 * - Special handling for -o flag: If -o is specified without slashes (e.g., `%% -o myfile`),
 *   it's used as the base filename for both the .mmd file and the resulting image.
 * - Other mmdc flags: You can use any mmdc flag in comments, like `%% -b transparent` 
 *   for transparent background or `%% -w 800` for width.
 *   More details on other available `mmdc` args: https://deepwiki.com/search/tell-me-all-the-args-that-i-ca_89d7646f-4aae-4549-9100-3597fdffad44
 * - Directory Structure: All assets and mermaid files are created in dedicated folders
 *   next to the markdown file, not in the root directory. 
 * 
 * Usage: node mermaid-to-png.js <markdown-file-path>
 * 
 * Prerequisites: Install mermaid-cli locally in your project using the "packages.json" file:
 * `yarn install`
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Setup and create necessary directories
 * @param {string} mdFilePath - Path to the markdown file
 * @returns {Object} - Object containing directory paths
 */
function setupDirectories(mdFilePath) {
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
  
  return { mdDir, mermaidDir, assetsDir };
}

/**
 * Find all mermaid code blocks in markdown content
 * @param {string} mdContent - Markdown content
 * @returns {Array} - Array of matches containing fullMatch and code
 */
function findMermaidBlocks(mdContent) {
  console.log(`Searching for mermaid code blocks...`);
  
  const mermaidRegex = /```\s*mermaid\s*\r?\n([\s\S]*?)\r?\n\s*```/g;
  let match;
  
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
  } else {
    console.log(`Found ${matches.length} mermaid diagrams`);
  }
  
  return matches;
}

/**
 * Extract command arguments from mermaid code comments
 * @param {string} mermaidCode - Mermaid diagram code
 * @param {number} counter - Counter for default naming
 * @returns {Object} - Object containing fileName and mmdc arguments
 */
function extractCommandArgs(mermaidCode, counter) {
  const lines = mermaidCode.split('\n').slice(0, 5);
  let fileName = `mermaid-${counter}`;
  let customArgs = {};
  
  // Look for a comment line with command arguments
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if this is a comment line with command args
    if (trimmedLine.startsWith('%%') && /%%\s+-\w/.test(trimmedLine)) {
      // Extract the arguments part after %%
      const argsText = trimmedLine.substring(2).trim();
      
      /**
       * Regular expression to parse command-line arguments in the form of -option value, handling quoted values.
       * 
       * Pattern breakdown:
       * -(\w)            - Matches a dash followed by a single word character (the option flag), captured in group 1
       * \s+              - Matches one or more whitespace characters after the option flag
       * (?:              - Start of a non-capturing group for the value part
       *   "([^"]+)"      - Matches a quoted string and captures the content in group 2
       *   |              - OR
       *   ([^\s"-][^\s]*) - Matches an unquoted value that doesn't start with whitespace, dash, or quote,
       *                     and continues until whitespace is encountered, captured in group 3
       * )                - End of non-capturing group
       * (?=\s+-\w|\s*$)  - Positive lookahead to ensure we're at the end of this argument:
       *                     either followed by whitespace and another flag, or at the end of the string
       * 
       * g                - Global flag to match all occurrences in the string
       * 
       * @type {RegExp}
       */
      const argRegex = /-(\w)\s+(?:"([^"]+)"|([^\s"-][^\s]*))(?=\s+-\w|\s*$)/g;
      let argMatch;
      
      while ((argMatch = argRegex.exec(argsText)) !== null) {
        const flag = `-${argMatch[1]}`; 
        // Value will be either the quoted value (group 2) or the unquoted value (group 3)
        const value = argMatch[2] !== undefined ? argMatch[2] : argMatch[3];
        
        console.log(`Found command line argument: ${flag} ${value}`);
        
        // Special handling for output file name (-o)
        if (flag === '-o' && !value.includes('/') && !value.includes('\\')) {
          // Remove file extension if present
          fileName = value.replace(/\.(png|svg|pdf|mmd)$/i, '');
          // Don't add to customArgs since we're handling it specially
        } else {
          // Store the argument for later use
          customArgs[flag] = value;
        }
      }
      
      // We've found and processed a command line, break out of the loop
      break;
    }
  }
  
  return { fileName, customArgs };
}

/**
 * Save mermaid code to a file
 * @param {string} mermaidCode - Mermaid diagram code
 * @param {string} mmdFilePath - Path to save the .mmd file
 */
function saveMermaidCodeToFile(mermaidCode, mmdFilePath) {
  fs.writeFileSync(mmdFilePath, mermaidCode);
  console.log(`${fs.existsSync(mmdFilePath) ? 'Updated' : 'Created'} ${mmdFilePath}`);
}

/**
 * Generate PNG from mermaid code using mmdc
 * @param {string} mmdFilePath - Path to the .mmd file
 * @param {string} pngFilePath - Path to save the PNG file
 * @param {Object} customArgs - Custom command line arguments
 * @param {string} fileName - Name of the file for logging
 * @returns {boolean} - true if successful, false otherwise
 */
function generatePng(mmdFilePath, pngFilePath, customArgs, fileName) {
  console.log(`\nGenerating PNG for ${fileName}...`);
  
  // Use locally installed mmdc from node_modules
  const mmdc_path = path.join(process.cwd(), 'node_modules', '.bin', 'mmdc');
  
  // Start with default command
  let mmdc_command = `"${mmdc_path}" -i "${mmdFilePath}" -o "${pngFilePath}"`;
  
  // Apply custom arguments if provided
  for (const [flag, value] of Object.entries(customArgs)) {
    // Skip -o flag if it doesn't contain slashes (already handled in file naming)
    if (flag === '-o' && !value.includes('/') && !value.includes('\\')) {
      continue;
    }
    
    // Replace the default arg with the custom one
    const flagRegex = new RegExp(`${flag}\\s+[^-]+`);
    if (mmdc_command.match(flagRegex)) {
      mmdc_command = mmdc_command.replace(flagRegex, `${flag} ${value}`);
    } else {
      // Add new argument
      mmdc_command += ` ${flag} ${value}`;
    }
  }
  
  // Execute the mmdc command
  try {
    console.log(`\nExecuting: ${mmdc_command}\n`);
    execSync(mmdc_command, { stdio: 'inherit' });
    console.log(`Generated ${pngFilePath}`);
    return true;
  } catch (err) {
    console.error(`Error generating diagram ${fileName}:`, err.message);
    console.error(`Make sure @mermaid-js/mermaid-cli is installed in this project using packages.json (yarn install)`);
    return false;
  }
}
/**
 * Update markdown content by replacing mermaid blocks with image references
 * @param {string} mdContent - Original markdown content
 * @param {Array} fileChanges - Array of changes to apply
 * @param {string} mdFilePath - Path to the markdown file
 * @returns {number} - Number of changes applied
 */
function updateMarkdown(mdContent, fileChanges, mdFilePath) {
  let modifiedMdContent = mdContent;
  
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
}

/**
 * Extract and process Mermaid diagrams from a Markdown file using mermaid-cli
 * @param {string} mdFilePath - Path to the Markdown file
 * @returns {Promise<number>} - Number of diagrams processed
 */
async function processMermaidDiagrams(mdFilePath) {
  // Read the markdown file
  const mdContent = fs.readFileSync(mdFilePath, 'utf8');
  
  // Setup directories
  const { mdDir, mermaidDir, assetsDir } = setupDirectories(mdFilePath);
  
  // Find all mermaid code blocks
  const matches = findMermaidBlocks(mdContent);
  if (matches.length === 0) {
    return 0;
  }
  
  try {
    let counter = 1;
    let fileChanges = [];
    
    for (const match of matches) {
      const mermaidCode = match.code;
      const fullMatch = match.fullMatch;
      
      // Extract command arguments
      const { fileName, customArgs } = extractCommandArgs(mermaidCode, counter);
      if (!fileName.startsWith('mermaid-')) {
        // If a custom filename was found, don't increment counter
      } else {
        // If default filename was used, increment counter
        counter++;
      }

      const mmdFilePath = path.join(mermaidDir, `${fileName}.mmd`);
      const pngFilePath = path.join(assetsDir, `${fileName}.png`);
      const relativePngPath = './' + path.relative(mdDir, pngFilePath).replace(/\\/g, '/');

      // Save mermaid code to .mmd file
      saveMermaidCodeToFile(mermaidCode, mmdFilePath);

      // Generate PNG using mmdc
      const success = generatePng(mmdFilePath, pngFilePath, customArgs, fileName);

      if (!success) {
        continue; // Skip to next diagram if there was an error
      }
      
      // Add to changes list
      const imageMarkdown = `![${fileName}](${relativePngPath})`;
      fileChanges.push({
        original: fullMatch,
        replacement: imageMarkdown
      });
    }
    
    // Update markdown content
    return updateMarkdown(mdContent, fileChanges, mdFilePath);
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