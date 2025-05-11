const fs = require('fs');
const path = require('path');
const glob = require('glob');

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
  // Use glob@11.0.2 syntax
  markdownFiles = glob.sync('**/*.md', { cwd: blogPostsPath });
  console.log(`Found ${markdownFiles.length} markdown files in blog-posts directory`);
} catch (err) {
  console.error('Error finding markdown files:', err.message);
  process.exit(1);
}

// Create a map to track file entries by their basename (filename without directory)
const fileBasenameMap = new Map();
markdownFiles.forEach(file => {
  const basename = path.basename(file);
  if (!fileBasenameMap.has(basename)) {
    fileBasenameMap.set(basename, []);
  }
  fileBasenameMap.get(basename).push(file);
});

// Log files with duplicate basenames (potential conflicts)
fileBasenameMap.forEach((files, basename) => {
  if (files.length > 1) {
    console.log(`Warning: Multiple files with the same name "${basename}":`);
    files.forEach(file => console.log(`  - blog-posts/${file}`));
  }
});

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
  
  // Check if the file exists in our markdown files list
  if (markdownFiles.includes(expectedRelativePath)) {
    // File exists at the expected path
    if (entry.relativePathToArticle !== relativePath) {
      // Normalize the path in the entry
      console.log(`Normalizing path from ${entry.relativePathToArticle} to ${relativePath}`);
      entry.relativePathToArticle = relativePath;
      updated = true;
    }
  } else {
    // File doesn't exist at the specified path
    console.log(`Warning: File not found at path ${relativePath} (ID: ${entry.id})`);
    
    // Try to find a match by filename
    const basename = path.basename(relativePath);
    const potentialMatches = fileBasenameMap.get(basename) || [];
      if (potentialMatches.length === 1) {
      // We found exactly one file with this name, assume it's a match
      const matchPath = potentialMatches[0];
      const newPath = `blog-posts/${matchPath.replace(/\\/g, '/')}`;
      console.log(`Found match: ${relativePath} → ${newPath} (ID: ${entry.id})`);
      entry.relativePathToArticle = newPath;
      updated = true;
    } else if (potentialMatches.length > 1) {
      // Multiple files with the same name, can't determine which one is correct
      console.log(`Unable to automatically update: Multiple files with name "${basename}" found:`);
      potentialMatches.forEach(match => console.log(`  - blog-posts/${match}`));
      console.log(`Please manually update the entry with ID ${entry.id} in dev-to-git.json`);
    } else {
      // No files with this name found
      console.log(`Unable to find any file matching basename "${basename}"`);
      console.log(`Please manually update the entry with ID ${entry.id} in dev-to-git.json`);
    }
  }
});

// If changes were made, write back to the file
if (updated) {
  try {
    // Create a backup of the original file
    const backupPath = `${devToGitPath}.backup-${Date.now()}`;
    fs.copyFileSync(devToGitPath, backupPath);
    console.log(`Created backup at ${backupPath}`);
    
    // Write the updated data back to the file
    fs.writeFileSync(devToGitPath, JSON.stringify(devToGitData, null, 2) + '\n');
    console.log('Updated dev-to-git.json with new paths');
  } catch (err) {
    console.error('Error writing to dev-to-git.json:', err.message);
  }
} else {
  console.log('No updates needed for dev-to-git.json');
}
