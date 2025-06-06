# One way publishing of your blog posts from a git repo to dev.to

This repo is just a template to help you get started quickly. If you're looking for an example of a repo using it, have a look here: https://github.com/maxime1992/my-dev.to

TOC:

- [One way publishing of your blog posts from a git repo to dev.to](#one-way-publishing-of-your-blog-posts-from-a-git-repo-to-devto)
  - [First, what is dev.to?](#first-what-is-devto)
  - [Why would I want to put all my blog posts on a git repo?](#why-would-i-want-to-put-all-my-blog-posts-on-a-git-repo)
  - [How do I choose which files I want to publish?](#how-do-i-choose-which-files-i-want-to-publish)
    - [Automatic Path Synchronization](#automatic-path-synchronization)
  - [How can I find the ID of my blog post on dev.to?](#how-can-i-find-the-id-of-my-blog-post-on-devto)
  - [How do I configure every blog post individually?](#how-do-i-configure-every-blog-post-individually)
  - [How do I add images to my blog posts?](#how-do-i-add-images-to-my-blog-posts)
  - [How to setup CI for auto deploying the blog posts?](#how-to-setup-ci-for-auto-deploying-the-blog-posts)
  - [Installation \& Setup](#installation--setup)
    - [Prerequisites](#prerequisites)
      - [Installing Yarn (if not already installed)](#installing-yarn-if-not-already-installed)
    - [Installing Dependencies](#installing-dependencies)
    - [Updating Dependencies](#updating-dependencies)
  - [Implementation Notes](#implementation-notes)
    - [Processing Mermaid in md Files](#processing-mermaid-in-md-files)
    - [Adjusting TOCs to be Dev.to Compatible](#adjusting-tocs-to-be-devto-compatible)
    - [Publishing to Other Platforms](#publishing-to-other-platforms)


## First, what is dev.to?

https://dev.to is a free and open source blogging platform for developers.

> dev.to (or just DEV) is a platform where software developers write articles, take part in discussions, and build their professional profiles. We value supportive and constructive dialogue in the pursuit of great code and career growth for all members. The ecosystem spans from beginner to advanced developers, and all are welcome to find their place within our community.

## Why would I want to put all my blog posts on a git repo?

- Don't be afraid to mess up with one of your articles while editing it
- Same good practices as when you're developing (format, commits, saving history, compare, etc)
- Use prettier to format the markdown and all the code
- Let people contribute to your article by creating a PR against it (tired of comments going sideways because of some typos? Just let people know they can make a PR at the end of your blog post)
- Create code examples close to your blog post and make sure they're correct thanks to [Embedme](https://github.com/zakhenry/embedme) (_\*1_)

_\*1: Embedme allows you to write code in actual files rather than your readme, and then from your Readme to make sure that your examples are matching those files._

If you prefer not to use Prettier or Embed me, you can do so by simply removing them but I think it's a nice thing to have!

## How do I choose which files I want to publish?

There's a `dev-to-git.json` file where you can define an array of blog posts, e.g.

```json
[
  {
    "id": 12345,
    "relativePathToArticle": "./the-blog-posts/name-of-your-blog-post/name-of-your-blog-post.md"
  }
]
```

> **Note:** This repository includes an automatic path synchronization feature that will keep your `dev-to-git.json` paths updated when you rename or move files. See the [documentation](docs/update-dev-to-git-json-upon-save.md) for details.

### Automatic Path Synchronization

This repository includes an automatic path synchronization system that keeps your `dev-to-git.json` file in sync with your actual markdown files. When you save a markdown file in the `the-blog-posts` directory, the system will automatically update the corresponding entries in `dev-to-git.json`.

For detailed information on how this works and how to set it up, see the [automatic path synchronization documentation](docs/update-dev-to-git-json-upon-save.md).

## How can I find the ID of my blog post on dev.to?

This repository is made to **edit** a blog post. Whether it's published or just a draft, you **have to create it** on dev.to directly. Unfortunately, dev.to does not display the ID of the blog post on the page. So once it's created, you can open your browser console and paste the following code to retrieve the blog post ID:  
`$('div[data-article-id]').getAttribute('data-article-id')`

## How do I configure every blog post individually?

A blog post has to have a [**front matter**](https://dev.to/p/editor_guide) header. You can find an example in this repository here: https://github.com/maxime1992/dev.to/blob/master/the-blog-posts/name-of-your-blog-post/name-of-your-blog-post.md

Simple and from there you have control over the following properties: `title`, `published`, `cover_image`, `description`, `tags`, `series` and `canonical_url`.

## How do I add images to my blog posts?

Instead of uploading them manually on dev.to, simply put them within your git repo and within the blog post use a relative link. Here's an example: `The following is an image: ![alt text](./assets/image.png 'Title image')`.

If you've got some plugin to preview your markdown from your IDE, the images will be correctly displayed. Then, on CI, right before they're published, the link will be updated to match the raw file.

## How to setup CI for auto deploying the blog posts?

If you want to use Github and Github Actions, a `.github/workflows/master.yml` file has been already prepared for you.

- Copy this template to your own Github account by clicking "Use this template"
- Open up this URL with your own username and repo name of the one you just created using the template: `https://github.com/your-username/your-repo-name/settings/secrets/actions`
- On the default "Secrets" tab, click on the "New repository secret"
- In the secret name, write `DEV_TO_GIT_TOKEN`
- Open up a new tab and go to this URL https://dev.to/settings/extensions. Scroll up to "DEV Community API Keys" and generate a new key. Copy it
- Go back to the Github tab and paste the key you just copied into the secret input

Enjoy.

## Installation & Setup

Note: you can see a detailed documentation of this repo's architecture here:
* https://deepwiki.com/OdyAsh/odyash-dev.to

### Prerequisites

First, make sure you have [Node.js](https://nodejs.org/) installed.

#### Installing Yarn (if not already installed)

If you don't have Yarn installed, you can install it using npm:

```bash
npm install -g yarn
```

On Windows, you may need to run PowerShell as administrator to install global packages.

### Installing Dependencies

Clone this repository and install the dependencies:

```bash
# Clone the repository (replace with your own repo if you've used the template)
git clone <your-repository-url>
cd <your-repository-name>

# Install dependencies using Yarn
yarn install
```

This will install all dependencies into the `node_modules/` folder based on the `yarn.lock` file, ensuring you get the exact same dependency versions used in the project.

### Updating Dependencies

If you want to update dependencies to their latest compatible versions:

```bash
# Remove the lock file
rm yarn.lock  # or del yarn.lock on Windows

# Install dependencies (this will create a new yarn.lock with latest versions)
yarn install
```

## Implementation Notes 

### Processing Mermaid in md Files

Since the original [dev-to-git repo](https://github.com/maxime1992/dev-to-git) doesn't automatically convert mermaid blocks embedded inside md files into images, this repository includes tools for handling Mermaid diagrams:
- Automatically converts Mermaid code blocks to PNG images before pushing to dev.to
- Restores the Mermaid code blocks locally for continued editing
- Includes VS Code tasks and Git hooks to automate the process

For detailed information and to set it up, see the [Mermaid diagram processing documentation](docs/mermaid-processing.md).

### Adjusting TOCs to be Dev.to Compatible

When publishing markdown blog posts to dev.to, the Table of Contents (TOC) anchor links must follow dev.to's specific rules (e.g., no double hyphens, special handling for code/backtick content, and removal of invisible/emoji characters). This repository includes a fully automated pipeline that:
- Runs end-to-end TOC conversion tests (`tests/test-toc-scripts.js`) on every push to catch regressions early
- Converts all TOCs to dev.to-compatible format before publishing
- Restores the original TOCs after publishing, so your local files remain unchanged

For a detailed explanation of the problem, the solution, the scripts involved, and the CI automation, see [docs/devto-toc-processing.md](docs/devto-toc-processing.md).

### Publishing to Other Platforms

I Researched on having a markdown -> LinkedIn automation flow, but my search results weren't that fruitful.

These are the 3 sources I have right now which I may use in the future if I were to implement such a flow:

1. https://dev.to/thegreatpaul/how-to-automatically-publish-on-linkedin-a-step-by-step-guide-2b8o
2. https://www.perplexity.ai/search/i-want-to-use-the-following-te-xpDyov6.RSqqwJyaS2opXQ?2=d
3. https://www.meyerperin.com/posts/2022-06-27-automatically-posting-to-linkedin.html
4. https://nickleeder.com/markedown-linkedin/