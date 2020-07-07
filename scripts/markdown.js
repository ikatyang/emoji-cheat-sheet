const { name: repoName, repository } = require("../package.json");

const resource1 = "[GitHub Emoji API](https://api.github.com/emojis)";
const resoruce2 =
  "[Unicode Full Emoji List](https://unicode.org/emoji/charts/full-emoji-list.html)";

const columns = 2;

const tocName = "Table of Contents";

/**
 * @typedef {Array<string[]>} GithubEmojiIds
 */

/**
 * @param {{ [category: string]: { [subcategory: string]: GithubEmojiIds } }} categorizedGithubEmojiIds
 */
function generateCheatSheet(categorizedGithubEmojiIds) {
  const lineTexts = [];

  lineTexts.push(`# ${repoName}`);
  lineTexts.push("");

  lineTexts.push(
    `[![Up to Date](https://github.com/${repository}/workflows/Up%20to%20Date/badge.svg)](https://github.com/${repository}/actions?query=workflow%3A%22Up+to+Date%22)`
  );
  lineTexts.push("");

  lineTexts.push(
    `This cheat sheet is automatically generated from ${resource1} and ${resoruce2}.`
  );
  lineTexts.push("");

  const categories = Object.keys(categorizedGithubEmojiIds);

  lineTexts.push(`## ${tocName}`);
  lineTexts.push("");
  lineTexts.push(...generateToc(categories));
  lineTexts.push("");

  for (const category of categories) {
    lineTexts.push(`### ${category}`);
    lineTexts.push("");

    const subcategorizeGithubEmojiIds = categorizedGithubEmojiIds[category];
    const subcategories = Object.keys(subcategorizeGithubEmojiIds);
    if (subcategories.length > 1) {
      lineTexts.push(...generateToc(subcategories));
      lineTexts.push("");
    }

    for (const subcategory of subcategories) {
      if (subcategory) {
        lineTexts.push(`#### ${subcategory}`);
        lineTexts.push("");
      }

      lineTexts.push(
        ...generateTable(
          subcategorizeGithubEmojiIds[subcategory],
          `[top](#${getHeaderId(category)})`,
          `[top](#${getHeaderId(tocName)})`
        )
      );
      lineTexts.push("");
    }
  }

  return lineTexts.join("\n");
}

/**
 * @param {string[]} headers
 */
function generateToc(headers) {
  return headers.map(header => `- [${header}](#${getHeaderId(header)})`);
}

/**
 * @param {string} header
 */
function getHeaderId(header) {
  return header
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * @param {GithubEmojiIds} githubEmojiIds
 * @param {string} leftText
 * @param {string} rightText
 */
function generateTable(githubEmojiIds, leftText, rightText) {
  const lineTexts = [];

  let header = "";
  let delimieter = "";

  header += "| ";
  delimieter += "| - ";
  for (let i = 0; i < columns && i < githubEmojiIds.length; i++) {
    header += `| ico | shortcode `;
    delimieter += "| :-: | - ";
  }
  header += "| |";
  delimieter += "| - |";

  lineTexts.push(header, delimieter);

  for (let i = 0; i < githubEmojiIds.length; i += columns) {
    let lineText = `| ${leftText} `;
    for (let j = 0; j < columns; j++) {
      if (i + j < githubEmojiIds.length) {
        const emojiIds = githubEmojiIds[i + j];
        const emojiId = emojiIds[0];
        lineText += `| :${emojiId}: | \`:${emojiId}:\` `;
        for (let k = 1; k < emojiIds.length; k++) {
          lineText += `<br /> \`:${emojiIds[k]}:\` `;
        }
      } else if (githubEmojiIds.length > columns) {
        lineText += "| | ";
      }
    }
    lineText += `| ${rightText} |`;
    lineTexts.push(lineText);
  }

  return lineTexts;
}

module.exports = {
  generateCheatSheet
};
