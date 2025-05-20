



# Mermaid Diagram Processing

This document explains VS Code tasks and Git hooks (used by this repo) to handle Mermaid diagrams in Markdown files.

***TOC:***

---
- [Mermaid Diagram Processing](#mermaid-diagram-processing)
  - [Features](#features)
  - [Usage](#usage)
    - [Via VS Code Tasks](#via-vs-code-tasks)
    - [Via npm/yarn Scripts](#via-npmyarn-scripts)
    - [Automated Git Hooks](#automated-git-hooks)
  - [How It Works](#how-it-works)
    - [Mermaid to Images](#mermaid-to-images)
    - [Images to Mermaid](#images-to-mermaid)
  - [Notes](#notes)
    - [Git Hooks Installation](#git-hooks-installation)
    - [Git Hooks Behavior](#git-hooks-behavior)
---


## Features

1. **Mermaid in md File -> PNG**: Extracts Mermaid diagrams from a Markdown file, saves them as `.mmd` files, generates PNG images, and updates the Markdown file with image references.
2. **PNG -> Mermaid in md File**: Finds image references in a Markdown file that correspond to `.mmd` files and replaces them with the original Mermaid code blocks.

## Usage

### Via VS Code Tasks

1. Open a Markdown file that contains Mermaid diagrams
2. Press `Ctrl+Shift+P` to open the Command Palette
3. Type "Run Task" and select "Tasks: Run Task"
4. Choose one of the following tasks:
   - **Mermaid in md File -> PNG**: To convert Mermaid code blocks to images
   - **PNG -> Mermaid in md File**: To restore image references back to Mermaid code

### Via npm/yarn Scripts

```bash
# Convert Mermaid diagrams in a file to images
yarn mermaid-to-png path/to/your/file.md

# Restore Mermaid diagrams from images
yarn png-to-mermaid path/to/your/file.md
```

### Automated Git Hooks

The repository includes shell-based Git hooks that automatically handle Mermaid diagrams during the Git workflow:

1. **Pre-push Hook**: Before pushing changes, this hook converts Mermaid diagrams to PNG images in all modified Markdown files.
2. **Post-push Hook**: After pushing changes, this hook restores Mermaid code blocks locally, so you can continue working with the editable diagrams.

The hooks are written in standard shell script (`#!/bin/sh`) for maximum compatibility across operating systems.

This ensures that:
- Only image references are pushed to the repository, making diagrams viewable on platforms like GitHub and dev.to
- You continue to work with editable Mermaid code blocks in your local environment

## How It Works

### Mermaid to Images

1. Scans the Markdown file for Mermaid code blocks (```mermaid)
2. For each code block:
   - Checks the first 5 lines for a filename pattern (e.g., `%% file name: my diagram`)
   - If found, uses that name (sanitized) for the files, preserving spaces within the name
   - If not found, uses a sequential number (e.g., `mermaid-1`)
   - Creates/overwrites a `.mmd` file in the `mermaid/` directory
   - Generates a PNG image in the `assets/` directory using Puppeteer to render the diagram
   - Replaces the Mermaid code block with a Markdown image reference

### Images to Mermaid

1. Scans the Markdown file for image references
2. For each image that points to the `assets/` directory:
   - Checks if a corresponding `.mmd` file exists in the `mermaid/` directory
   - If found, reads the Mermaid code and replaces the image reference with a Mermaid code block

## Notes

- Directories (`mermaid/` and `assets/`) are created automatically if they don't exist
- Both directories are created next to the Markdown file, not in the root directory
- Existing `.mmd` files are always overwritten with the current Mermaid code
- File naming supports a special comment pattern: `%% file name: your diagram name`
- Any `.mmd` or `.mermaid` extension in the filename comment is automatically removed
- Spaces in filenames are preserved (except leading/trailing spaces)
- Invalid characters in filenames are replaced with hyphens
- Git hooks automatically handle conversion during push operations

### Git Hooks Installation

**Important Note:** Git hooks are stored in the `.git/hooks` directory, which is not transferred when cloning a repository. If you're setting up a fresh clone of this repository, you'll need to install the hooks manually.

To install the Git hooks:

**Method A: Configure Git to use .githooks directory**

Note 1: If you're a collaborator on this repository, it's recommended to use `Method B` below. Otherwise, you'll need to align with other collaborators in case you make any modifications to the hooks in the `.githooks` directory.

```bash
git config core.hooksPath .githooks --replace-all
```

Then, verify that the git hooks path has changed by running this command:

```bash
git config core.hooksPath
```

Which should now display `.githooks`.

Note 1: [core.hooksPath](https://git-scm.com/docs/githooks/2.9.5#_description) will work only if your [git version is >= 2.9.0](https://github.blog/open-source/git/git-2-9-has-been-released/#:~:text=You%20can%20now%20specify%20a%20custom%20path%20for%20hooks) (e.g., `2.33.0`, etc.). You can check your git version with:

```bash
git --version
```

Side note 1: I added the `--replace-all` flag because of the following observation:
* I wanted to see the inner logs of `core.hooksPath` command above to make sure it worked.
* So I ran `$env:GIT_TRACE = 1` in PowerShell (`export GIT_TRACE=1` in bash) [to enable tracing in git](https://stackoverflow.com/a/55599672/13626137).
* Then I ran `git config core.hooksPath .githooks` what I found is this:
  * `warning: core.hookspath has multiple values`
  * `error: cannot overwrite multiple values with a single value`
  * `       Use a regexp, --add or --replace-all to change core.hooksPath.`
* Therefore, I changed `GIT_TRACE` back to `0` and added the `--replace-all` flag to the command.


**Method B: Copy hooks to .git/hook and (optionally) make them executable:**

```bash
# On bash/etc. (Unix-like systems)
cp .githooks/* .git/hooks/

# Optional:
# Apply executable permissions to git hook files. Details:
# -v                    - Verbose mode, outputs names of files being changed
# +x                    - Adds executable permission to files
# find .git/hooks/      - Search in the git hooks directory
# -type f               - Find only files (not directories)
# ! -name "*.sample"    - Exclude files ending with .sample extension
chmod -v +x $(find .git/hooks/ -type f ! -name "*.sample")

# On PowerShell (Windows):

Copy-Item -Path .githooks\* -Destination .git\hooks\ -Force

# Optional:
# Apply executable permissions to git hook files.
Get-ChildItem .git/hooks -File | Where-Object { -not $_.Name.EndsWith('.sample') } | ForEach-Object { Set-ItemProperty -Path $_.FullName -Name IsReadOnly -Value $false }
```

### Git Hooks Behavior

The Git hooks perform the following actions:

1. **Pre-push hook**:
   - Identifies all modified Markdown files that are about to be pushed
   - Creates `assets/` and `mermaid/` directories if they don't exist
   - Converts Mermaid diagrams to images using the `mermaid-to-png` script
   - Automatically stages the generated PNG and MMD files to be included in the commit(s) about to be pushed

2. **Post-push hook**:
   - Identifies Markdown files that were just pushed
   - Creates `assets/` and `mermaid/` directories if they don't exist
   - Restores Mermaid code blocks using the `png-to-mermaid` script
   - Leaves these changes unstaged (local only)
