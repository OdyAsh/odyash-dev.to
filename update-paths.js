/**
 * update-paths.js - Path Synchronization Tool for dev.to Blog Posts
 * ---------------------------------------------------------------
 * 
 * This script keeps the file paths in dev-to-git.json in sync with your actual markdown files.
 * 
 * What It Does:
 * ------------
 * 1. SCAN: Finds all markdown files in the blog-posts directory
 *    Example: "blog-posts/vibe-coding/01-surviving-the-vibe-coding-trend.md"
 * 
 * 2. CHECK: For each entry in dev-to-git.json, checks if the file still exists at that path
 *    If it exists: Ensures the path format is correct (e.g., adds "blog-posts/" prefix if missing)
 *    If it doesn't exist: Proceeds to step 3
 * 
 * 3. MATCH: Uses fuzzy matching to find files that might be the same but were moved/renamed
 *    Example: If you moved a file from "blog-posts/coding/file.md" to "blog-posts/vibe-coding/file.md",
 *             the script will find it based on path similarity (if >50% similar)
 *  * 4. UPDATE: Updates dev-to-git.json with the new paths
 *    If a good match was found: Updates the path automatically
 *    If no match was found: Tells you to update the path manually
 * 
 * Usage:
 * -----
 * This script runs automatically when you save a markdown file in the blog-posts directory.
 * You can also run it manually using:
 *   - npm run update-paths
 *   - VS Code task: "Sync File Paths With dev-to-git.json" (defined in .vscode/tasks.json)
 */

const fs = require('fs');
const path = require('path');

// Recursive file finder function to replace glob
function findFiles(baseDir, pattern, currentDir = baseDir, fileList = []) {
  // Read directory contents
  const files = fs.readdirSync(currentDir);
  
  // Process each file/directory
  for (const file of files) {
    const filePath = path.join(currentDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search subdirectories
      findFiles(baseDir, pattern, filePath, fileList);
    } else {
      // Check if the file matches the pattern
      if (file.match(pattern)) {
        // Add relative path (from the base directory) to the list
        let relativePath = path.relative(baseDir, filePath);
        // Convert Windows backslashes to forward slashes for consistency
        relativePath = relativePath.replace(/\\/g, '/');
        fileList.push(relativePath);
      }
    }
  }
  
  return fileList;
}

// Add fuzzy matching capability
const fuzzy = {
  // Calculate string similarity using Levenshtein distance algorithm
  similarity: function(str1, str2) {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;
    
    const len1 = str1.length;
    const len2 = str2.length;
    
    // If one of the strings is empty, the distance is the length of the other string
    if (len1 === 0) return 0;
    if (len2 === 0) return 0;
    
    // Create a matrix to store distances between substrings
    let matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
    
    // Initialize first row and column
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    // Fill the matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,           // deletion
          matrix[i][j - 1] + 1,           // insertion
          matrix[i - 1][j - 1] + cost     // substitution
        );
      }
    }
    
    // Calculate similarity score (0-1)
    const maxLen = Math.max(len1, len2);
    return 1 - (matrix[len1][len2] / maxLen);
  },
  
  // Find best match from an array of candidates
  findBestMatch: function(target, candidates) {
    if (!candidates || candidates.length === 0) return { bestMatch: null, similarity_score: 0 };

    let bestMatch = null;
    let highestScore = 0;
    
    candidates.forEach(candidate => {
      const score = this.similarity(target, candidate);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = candidate;
      }
    });

    return { bestMatch, similarity_score: highestScore };
  }
};

console.log('Running update-paths.js to sync dev-to-git.json with blog-posts directory...');

// Check if the blog-posts directory exists
const blogPostsPath = path.join(__dirname, 'blog-posts');
if (!fs.existsSync(blogPostsPath)) {
  console.error('Error: blog-posts directory not found!');
  process.exit(1);
}

// Load the dev-to-git.json file
const devToGitPath = path.join(__dirname, 'dev-to-git.json');
let devToGitData;
try {
  const devToGitContent = fs.readFileSync(devToGitPath, 'utf8');
  devToGitData = JSON.parse(devToGitContent);
} catch (err) {
  console.error('Error reading or parsing dev-to-git.json:', err.message);
  process.exit(1);
}

// Find all markdown files in the blog-posts directory
let markdownFiles;
try {
  // Using custom findFiles function instead of glob
  markdownFiles = findFiles(blogPostsPath, /\.md$/);
  console.log(`Found ${markdownFiles.length} markdown files in blog-posts directory`);
} catch (err) {
  console.error('Error finding markdown files:', err.message);
  process.exit(1);
}

// No need for basename mapping since we're using fuzzy matching on full paths

let updated = false;

// Check each entry in dev-to-git.json to see if its file still exists
devToGitData.forEach(entry => {
  if (!entry.relativePathToArticle) {
    console.log(`Warning: Entry with ID ${entry.id} has no relativePathToArticle`);
    return;
  }

  // Normalize the path (replace backslashes with forward slashes)
  const normalizedPath = entry.relativePathToArticle.replace(/\\/g, '/');
  
  // Make sure the path starts with blog-posts/
  const relativePath = normalizedPath.startsWith('blog-posts/') 
    ? normalizedPath 
    : `blog-posts/${normalizedPath}`;
  
  // Get the path relative to blog-posts directory
  const expectedRelativePath = relativePath.replace('blog-posts/', '');
  // First check if the file exists at the exact path
  // Our findFiles function already returns paths with forward slashes
  if (markdownFiles.includes(expectedRelativePath)) {
    // File exists at the expected path
    if (entry.relativePathToArticle !== relativePath) {
      // Normalize the path in the entry
      console.log(`Normalizing path from ${entry.relativePathToArticle} to ${relativePath}`);
      entry.relativePathToArticle = relativePath;
      updated = true;
    }
  } else {
    // File doesn't exist at the specified path - use fuzzy matching to find the best match
    console.log(`Warning: File not found at path ${relativePath} (ID: ${entry.id})`);    // Create full paths for all markdown files for better matching
    const fullMarkdownPaths = markdownFiles.map(file => `blog-posts/${file}`);

    // Use fuzzy matching to find the best match
    const { bestMatch, similarity_score } = fuzzy.findBestMatch(relativePath, fullMarkdownPaths);
    if (bestMatch && similarity_score > 0.5) {  // More than 50% match
      console.log(`Found fuzzy match with ${Math.round(similarity_score * 100)}% similarity:`);
      console.log(`  ${relativePath} → ${bestMatch} (ID: ${entry.id})`);
      entry.relativePathToArticle = bestMatch;
      updated = true;
    } else {
      console.log(`No good match found for ${relativePath} (ID: ${entry.id})`);
      console.log(`Please manually update the entry with ID ${entry.id} in dev-to-git.json`);
    }
  }
});

// If changes were made, write back to the file
if (updated) {
  try {
    // Write the updated data back to the file (YOLO mode - no backups)
    fs.writeFileSync(devToGitPath, JSON.stringify(devToGitData, null, 2) + '\n');
    console.log('Updated dev-to-git.json with new paths');
  } catch (err) {
    console.error('Error writing to dev-to-git.json:', err.message);
  }
} else {
  console.log('No updates needed for dev-to-git.json');
}
