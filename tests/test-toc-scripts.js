/*
test-toc-scripts.js
-------------------
This test script validates the behavior of the TOC conversion and restoration scripts:
- apply-devto-toc-to-md-files.js
- markdown-toc-to-devto-toc.js
- return-md-files-to-original-toc.js

Code Flow:
1. Sets up a temporary markdown file and a temporary dev-to-git.json entry.
2. Runs the TOC conversion script and checks:
   a. That the TOC in the markdown file is converted as expected.
   b. That a backup file is created.
3. Runs the restoration script and checks:
   a. That the original TOC is restored in the markdown file.
   b. That the backup file is deleted.
4. Cleans up all temporary files.
5. Logs each step and result.

Example:
- Input TOC: ["Test `lvl1` Heading"](#test---lvl1--heading)
- After conversion: ["Test `lvl1` Heading"](#test-lvl1-heading)
- After restore: ["Test `lvl1` Heading"](#test---lvl1--heading)

Usage:
In the terminal, run:
node test/test-toc-scripts.js
*/

// Test for apply-devto-toc-to-md-files.js and markdown-toc-to-devto-toc.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const tmpMd = path.resolve(__dirname, 'test-toc.md');
const tmpBackup = path.resolve(__dirname, 'test-toc-original-toc.md');
const tmpJson = path.resolve(__dirname, 'test-dev-to-git.json');
const origJson = path.resolve(__dirname, '../dev-to-git.json');
const scriptsDir = path.resolve(__dirname, '../scripts');

// Multiline sample markdown for testing, including a new lvl2 test case
const sampleMd = `
---
content: val
---

_**TOC:**_
- ["Test \`lvl1\` Heading"](#test---lvl1--heading)
- ["Another -- Heading"](#another----heading)
- ["\`lvl2\`"](#lvl2)
- ["Why Should I join CS When Code Can Be Easily Vibed 🏄‍♂️ ?"](#why-should-i-join-cs-when-code-can-be-easily-vibed-️-)
  - ["Problem Complexity? Huh?"](#problem-complexity-huh)
  - ["Ok, So Does The AI *Vibe* ✨ With All of These Levels?"](#ok-so-does-the-ai-vibe--with-all-of-these-levels)
- ["What You're Saying is a Little Bit Abstract. Examples, Plz?"](#what-youre-saying-is-a-little-bit-abstract-examples-plz)
  - [First - Strategic Thinking (\`lvl1\`)](#first---strategic-thinking-lvl1)
  - [Next - Technical Decision Making (\`lvl2\`)](#next---technical-decision-making-lvl2)
  - [Then - Tactical Problem Solving (\`lvl3\`)](#then---tactical-problem-solving-lvl3)
  - [Finally - Function Implementation (\`lvl4\`)](#finally---function-implementation-lvl4)
  - [Final Product](#final-product)
  - [Lessons Learned From This Journey](#lessons-learned-from-this-journey)
- [Footnotes and References](#footnotes-and-references)
- [If you Have Any Questions/Suggestions...](#if-you-have-any-questionssuggestions)
- [And If I made a mistake](#and-if-i-made-a-mistake)


---
`;

// Multiline expected markdown output for verification (entire file, not just TOC)
const expectedMd = `
---
content: val
---

_**TOC:**_
- ["Test \`lvl1\` Heading"](#test-raw-lvl1-endraw-heading)
- ["Another -- Heading"](#another-heading)
- ["\`lvl2\`"](#-raw-lvl2-endraw-)
- ["Why Should I join CS When Code Can Be Easily Vibed 🏄‍♂️ ?"](#why-should-i-join-cs-when-code-can-be-easily-vibed-)
  - ["Problem Complexity? Huh?"](#problem-complexity-huh)
  - ["Ok, So Does The AI *Vibe* ✨ With All of These Levels?"](#ok-so-does-the-ai-vibe-with-all-of-these-levels)
- ["What You're Saying is a Little Bit Abstract. Examples, Plz?"](#what-youre-saying-is-a-little-bit-abstract-examples-plz)
  - [First - Strategic Thinking (\`lvl1\`)](#first-strategic-thinking-raw-lvl1-endraw-)
  - [Next - Technical Decision Making (\`lvl2\`)](#next-technical-decision-making-raw-lvl2-endraw-)
  - [Then - Tactical Problem Solving (\`lvl3\`)](#then-tactical-problem-solving-raw-lvl3-endraw-)
  - [Finally - Function Implementation (\`lvl4\`)](#finally-function-implementation-raw-lvl4-endraw-)
  - [Final Product](#final-product)
  - [Lessons Learned From This Journey](#lessons-learned-from-this-journey)
- [Footnotes and References](#footnotes-and-references)
- [If you Have Any Questions/Suggestions...](#if-you-have-any-questionssuggestions)
- [And If I made a mistake](#and-if-i-made-a-mistake)


---
`;

function log(msg) { console.log('[test-apply-devto-toc]', msg); }

function setup() {
    // Write the sample markdown content to the test markdown file
    // This file will be used as the input for TOC conversion
    // Log the sample markdown input for debugging
    console.log('\n[test-apply-devto-toc] ############### MD Input Start ###############\n' + sampleMd + '\n[test-apply-devto-toc] ############### MD Input End ###############\n');
    // Write the sample markdown content to the test markdown file
    fs.writeFileSync(tmpMd, sampleMd, 'utf8');
    // Write a temporary dev-to-git.json file that points to the test markdown file
    // This ensures only our test file is processed by the scripts
    const relativeTestMd = './' + path.relative(path.dirname(origJson), tmpMd).replace(/\\/g, '/');
    console.log('[test-apply-devto-toc] relativeTestMd for dev-to-git.json:', relativeTestMd);
    fs.writeFileSync(tmpJson, JSON.stringify([{ relativePathToArticle: relativeTestMd }], null, 2), 'utf8');
    // Backup the original dev-to-git.json so we can restore it after the test
    fs.copyFileSync(origJson, origJson + '.bak');
    // Overwrite the real dev-to-git.json with our test version
    fs.copyFileSync(tmpJson, origJson);
    // Log that setup is complete
    log('Setup complete.');
}

function cleanup() {
    [tmpMd, tmpBackup, tmpJson].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
    if (fs.existsSync(origJson + '.bak')) fs.copyFileSync(origJson + '.bak', origJson);
    if (fs.existsSync(origJson + '.bak')) fs.unlinkSync(origJson + '.bak');
    log('Cleanup complete.');
}

function testApply() {
  execSync(`node "${scriptsDir}/apply-devto-toc-to-md-files.js"`, { stdio: 'inherit' });
  const after = fs.readFileSync(tmpMd, 'utf8');
  // Compare the entire output file to the expected markdown
  if (after.trim() !== expectedMd.trim()) {
    fs.writeFileSync(path.resolve(__dirname, 'test_expected_out.txt'), expectedMd, 'utf8');
    fs.writeFileSync(path.resolve(__dirname, 'test_actual_out.txt'), after, 'utf8');
    throw new Error('TOC conversion failed! Difference between expected/actual outputs can be found in test_expected_out.txt and test_actual_out.txt respectively');
  }
  if (!fs.existsSync(tmpBackup)) throw new Error('Backup not created!');
  log('TOC conversion and backup: OK');
}

function testRestore() {
    execSync(`node "${scriptsDir}/return-md-files-to-original-toc.js"`, { stdio: 'inherit' });
    const restored = fs.readFileSync(tmpMd, 'utf8');
    if (!restored.includes('#test---lvl1--heading')) throw new Error('Restore failed!');
    if (fs.existsSync(tmpBackup)) throw new Error('Backup not deleted!');
    log('Restore: OK');
}

try {
    setup();
    testApply();
    testRestore();
    log('All tests passed.');
} catch (e) {
    log('Test failed: ' + e.message);
} finally {
    cleanup();
}
