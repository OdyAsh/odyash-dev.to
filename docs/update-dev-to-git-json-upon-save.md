# Automatic Path Synchronization for dev.to Blog Posts

This document explains the automatic path synchronization system implemented in this repository to keep the `dev-to-git.json` file in sync with your actual markdown files.

***TOC:***

---

- [Automatic Path Synchronization for dev.to Blog Posts](#automatic-path-synchronization-for-devto-blog-posts)
  - [Quick Start Guide](#quick-start-guide)
    - [What It Does](#what-it-does)
    - [When It Runs](#when-it-runs)
    - [Requirements](#requirements)
    - [Installation](#installation)
  - [Technical Details](#technical-details)
    - [Motivation](#motivation)
    - [Implementation](#implementation)
      - [Files Structure](#files-structure)
      - [How It Works](#how-it-works)
      - [Fuzzy Matching Algorithm](#fuzzy-matching-algorithm)
    - [Code Examples](#code-examples)
      - [1. VS Code Task Definition (tasks.json)](#1-vs-code-task-definition-tasksjson)
      - [2. Trigger Task on Save Configuration (settings.json)](#2-trigger-task-on-save-configuration-settingsjson)
      - [3. NPM Script (package.json)](#3-npm-script-packagejson)
    - [Troubleshooting](#troubleshooting)

---


## Quick Start Guide

### What It Does

When you save a markdown file in the `blog-posts` directory, the system automatically updates the corresponding entry in `dev-to-git.json` to point to the new location.

### When It Runs

The path synchronization happens:
1. **Automatically** when you save any markdown file in the `blog-posts` directory
2. **Automatically** when you open the workspace (VS Code)
3. **Manually** when you run the task "Update dev-to-git.json paths" from VS Code's Command Palette

### Requirements

1. VS Code extension: "Trigger Task on Save" (`philfontaine.trigger-task-on-save`)
2. NPM package: `glob` (already installed in devDependencies)

### Installation

1. Install the [required VS Code extension](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.triggertaskonsave):
   ```
   code --install-extension Gruntfuggly.triggertaskonsave
   ```

2. Make sure the npm dependencies are installed:
   ```
   npm install
   ```

## Technical Details

### Motivation

The original dev.to publishing workflow requires manually updating the `dev-to-git.json` file whenever you rename or move a blog post file. This process is error-prone and tedious, potentially leading to failed builds or missing articles.

To solve this problem, we implemented an automatic path synchronization system that:
1. Automatically updates the corresponding paths in `dev-to-git.json` upon saving a markdown file
2. Uses fuzzy matching to handle more complex file reorganizations

### Implementation

#### Files Structure

1. **`update-paths.js`**: The main script that synchronizes paths using fuzzy matching
2. **`.vscode/tasks.json`**: Defines the VS Code tasks to run the script
3. **`.vscode/settings.json`**: Configures the "[Trigger Task on Save](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.triggertaskonsave)" extension 
4. **`package.json`**: Includes the script command and required dependencies

#### How It Works

The system uses a combination of:

1. **VS Code Tasks** defined in `.vscode/tasks.json`:
   - "Update dev-to-git.json paths" task runs the script manually
   - "Check file changes" task runs on workspace open

2. **Trigger Task on Save** using the "Trigger Task on Save" extension configured in `.vscode/settings.json`:
   - Runs the "Check file changes" task when a markdown file in `blog-posts` is saved

3. **Path Synchronization Logic** in `update-paths.js`:
   - Scans all markdown files in the blog-posts directory
   - For each entry in dev-to-git.json, checks if the file still exists at the specified path
   - If not, uses fuzzy string matching to find the most similar path
   - Updates dev-to-git.json with the new paths if similarity is greater than 50%

#### Fuzzy Matching Algorithm

The system implements a Levenshtein distance-based algorithm to compare file paths and find the best match when files are moved or renamed. This allows it to handle:

- Directory renames
- File moves between directories
- Path normalization (backslashes vs forward slashes)
- Mixed case sensitivity
- Small typos or changes in filenames

### Code Examples

#### 1. VS Code Task Definition (tasks.json)

```json
{
  "label": "Update dev-to-git.json paths",
  "type": "shell",
  "command": "npm",
  "args": ["run", "update-paths"],
  "presentation": {
    "reveal": "silent",
    "panel": "shared"
  },
  "problemMatcher": []
}
```

#### 2. Trigger Task on Save Configuration (settings.json)

```json
"triggerTaskOnSave.tasks": {
  "Check file changes": ["blog-posts/**/*.md"]
},
"triggerTaskOnSave.showStatusBarToggle": true,
"triggerTaskOnSave.on": true,
"triggerTaskOnSave.resultIndicator": "statusBarItem"
```

#### 3. NPM Script (package.json)

```json
"scripts": {
  "update-paths": "node update-paths.js"
}
```

### Troubleshooting

If path synchronization is not working:

1. **Check if the "Trigger Task on Save" extension is installed**
   - Run `code --list-extensions | grep Gruntfuggly.triggertaskonsave`
   - If not found, install it with `code --install-extension Gruntfuggly.triggertaskonsave`

2. **Verify that the task runs when files are saved**
   - Look for notifications in the status bar when saving a markdown file
   - Check the output panel for any error messages

3. **Run the task manually**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Run Task" and select "Update dev-to-git.json paths"

4. **Check the console output**
   - The script logs its actions, which can help identify any issues

5. **Verify the fuzzy matching threshold**
   - The current threshold is set to 50% similarity
   - If files are not being matched correctly, you may need to adjust this threshold in the script