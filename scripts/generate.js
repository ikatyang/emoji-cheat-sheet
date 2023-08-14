const { getCategorizeGithubEmojiIds } = require("./fetch");
const { generateCheatSheet } = require("./markdown");

async function generate() {
  return generateCheatSheet(await getCategorizeGithubEmojiIds());
}

if (require.main === /** @type {unknown} */ (module)) {
  generate().then(cheatSheet => console.log(cheatSheet));
} else {
  module.exports = generate;
}
