const $ = require("cheerio");
const dedent = require("dedent");
const request = require("request");
const packageJson = require("../package.json");

const apiUrl = "https://api.github.com/emojis";
const sheetUrl = "http://www.emoji-cheat-sheet.com";

const columns = 2;

/**
 * @typedef {string} EmojiId
 * @typedef {{ [category: string]: EmojiId[] }} EmojiData
 */

const tocName = "Table of Contents";
const topName = "top";
const topHref = "#table-of-contents";

async function generateCheatSheet() {
  return buildTable(await getData());
}

/**
 * @returns {Promise<EmojiData>}
 */
async function getData() {
  const apiHtml = await fetchHtml(apiUrl);
  const sheetHtml = await fetchHtml(sheetUrl);

  const apiJson = /** @type {Record<EmojiId, string>} */ (JSON.parse(apiHtml));

  const emojiIds = Object.keys(apiJson);
  const emojiData = /** @type {EmojiData} */ ({});

  const $html = $.load(sheetHtml).root();
  $html.find("h2").each((_, $category) => {
    const localEmojiIds = /** @type {string[]} */ ([]);
    const category = $($category).text();
    $html
      .find(`#emoji-${category.toLowerCase()} li .name`)
      .each((_, $emoji) => {
        const emoji = $($emoji).text();
        const index = emojiIds.indexOf(emoji);
        if (index !== -1) {
          localEmojiIds.push(...emojiIds.splice(index, 1));
        }
      });
    emojiData[category] = localEmojiIds;
  });

  if (emojiIds.length !== 0) {
    emojiData["Uncategorized"] = emojiIds;
  }

  return emojiData;
}

/**
 * @param {EmojiData} emojiData
 * @returns {string}
 */
function buildTable(emojiData) {
  const travisRepoUrl = `https://travis-ci.org/${packageJson.repository}`;
  const travisBadgeUrl = `${travisRepoUrl}.svg?branch=master`;
  const categories = Object.keys(emojiData);
  return dedent(`
    # ${packageJson.name}

    [![build](${travisBadgeUrl})](${travisRepoUrl})

    This cheat sheet is automatically generated from ${[
      ["GitHub Emoji API", apiUrl],
      ["Emoji Cheat Sheet", sheetUrl]
    ]
      .map(([siteName, siteUrl]) => `[${siteName}](${siteUrl})`)
      .join(" and ")}.

    ## ${tocName}

    ${categories
      .map(category => `- [${category}](#${category.toLowerCase()})`)
      .join("\n")}

    ${categories
      .map(category => {
        const emojis = emojiData[category];
        return dedent(`
          ### ${category}

          ${buildTableHead()}
          ${buildTableContent(emojis)}
        `);
      })
      .join("\n".repeat(2))}
  `);
}

/**
 * @param {string[]} emojis
 */
function buildTableContent(emojis) {
  let tableContent = "";
  for (let i = 0; i < emojis.length; i += columns) {
    const rowEmojis = emojis.slice(i, i + columns);
    while (rowEmojis.length < columns) {
      rowEmojis.push("");
    }
    tableContent += `| [${topName}](${topHref}) |${rowEmojis
      .map(x => (x.length !== 0 ? ` :${x}: | \`:${x}:\` ` : " | "))
      .join("|")}|\n`;
  }
  return tableContent;
}

function buildTableHead() {
  return dedent(`
    |   |${" ico | emoji |".repeat(columns)}
    | - |${" --- | ----- |".repeat(columns)}
  `);
}

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const options = /** @type {request.Options} */ ({ url });
    if (url === apiUrl) {
      options.headers = {
        "User-Agent": "https://github.com/ikatyang/emoji-cheat-sheet"
      };
    }
    request.get(options, (error, response, html) => {
      if (!error && response.statusCode === 200) {
        resolve(html);
      } else {
        reject(
          error
            ? error
            : `Unexpected response status code: ${response.statusCode}`
        );
      }
    });
  });
}

if (require.main === /** @type {unknown} */ (module)) {
  generateCheatSheet().then(cheatSheet => console.log(cheatSheet));
} else {
  module.exports = generateCheatSheet;
}
