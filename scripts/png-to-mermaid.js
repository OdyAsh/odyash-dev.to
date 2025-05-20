/**
 * RESTORE MERMAID DIAGRAMS FROM PNG REFERENCES
 * 
 * This script reverses the process of mermaid-to-png.js by:
 * 1. Finding image references in a markdown file
 * 2. Checking if they have corresponding .mmd files in the 'mermaid/' directory
 * 3. Replacing the image references with the original Mermaid code blocks
 * 
 * Logical Flow:
 * 1. Read the markdown file content
 * 2. Locate the 'mermaid/' directory next to the markdown file
 * 3. Find all image references in the markdown
 * 4. For each image reference that points to the 'assets/' directory:
 *    - Look for a corresponding .mmd file in the 'mermaid/' directory
 *    - If found, replace the image reference with the Mermaid code block
 * 5. Save the updated markdown file
 * 
 * Special Behaviors:
 * - File Matching: The script matches PNG image references to their .mmd source files
 *   by examining image paths containing 'assets/' and finding a .mmd file with the
 *   same base name in the 'mermaid/' directory.
 * - Directory Assumption: The script expects the mermaid/ directory to be located
 *   in the same directory as the markdown file being processed.
 * - Code Block Formatting: When restoring mermaid diagrams, the script creates proper
 *   markdown code blocks with ```mermaid syntax fencing, ensuring the code will be
 *   rendered as a diagram when viewed in compatible markdown renderers.
 * - Non-Mermaid Images: The script only processes images that have corresponding .mmd
 *   files in the mermaid/ directory. Other image references remain unchanged.
 * - Path Handling: Works with relative paths in image references, making it compatible
 *   with both local development and publishing workflows.
 * 
 * Usage: node png-to-mermaid.js <markdown-file-path>
 */
const fs = require('fs');
const path = require('path');

/**
 * Find image references in an MD file that have corresponding .mmd files
 * and replace them with the mermaid code blocks
 * @param {string} mdFilePath - Path to the Markdown file
 * @returns {number} - Number of diagrams restored
 */
function restoreMermaidDiagrams(mdFilePath) {
  // Read the markdown file
  const mdContent = fs.readFileSync(mdFilePath, 'utf8');
  
  // Directory setup
  const mdDir = path.dirname(mdFilePath);
  const mermaidDir = path.join(mdDir, 'mermaid');
  
  if (!fs.existsSync(mermaidDir)) {
    console.log(`No mermaid directory found at ${mermaidDir}, nothing to restore`);
    return 0;
  }
  
  // Find all image references
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  let match;
  let counter = 0;
  let modifiedMdContent = mdContent;
  
  while ((match = imageRegex.exec(mdContent)) !== null) {
    const altText = match[1];
    const imagePath = match[2];
    const fullMatch = match[0];
    
    // Check if this is a reference to a file in the assets directory
    if (imagePath.includes('assets/')) {
      // Extract the filename without extension
      const imageFileName = path.basename(imagePath, path.extname(imagePath));
      
      // Construct potential .mmd filepath
      const mmdFilePath = path.join(mermaidDir, `${imageFileName}.mmd`);
      
      if (fs.existsSync(mmdFilePath)) {
        // Found a matching .mmd file, read its contents
        const mermaidCode = fs.readFileSync(mmdFilePath, 'utf8');
        const mermaidBlock = '```mermaid\n' + mermaidCode + '\n```';
        
        // Replace the image reference with the mermaid code
        modifiedMdContent = modifiedMdContent.replace(fullMatch, mermaidBlock);
        counter++;
        
        console.log(`Restored mermaid diagram for ${imageFileName}`);
      }
    }
  }
  
  // Write the modified content back if there were changes
  if (modifiedMdContent !== mdContent) {
    fs.writeFileSync(mdFilePath, modifiedMdContent);
    console.log(`Updated ${mdFilePath} with ${counter} mermaid code blocks`);
  }
  
  return counter;
}

// If called directly via command line
if (require.main === module) {
  const mdFilePath = process.argv[2];
  
  if (!mdFilePath) {
    console.error('Please provide a markdown file path');
    process.exit(1);
  }
  
  if (!fs.existsSync(mdFilePath)) {
    console.error(`File not found: ${mdFilePath}`);
    process.exit(1);
  }
  
  const changesCount = restoreMermaidDiagrams(mdFilePath);
  console.log(`Restored ${changesCount} Mermaid diagrams`);
}

module.exports = { restoreMermaidDiagrams };
