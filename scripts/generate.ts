import { getCategorizeGithubEmojiIds } from './fetch.js'
import { generateCheatSheet } from './markdown.js'

export async function generate() {
  return generateCheatSheet(await getCategorizeGithubEmojiIds())
}

if (process.argv[2] === 'run') {
  console.log(await generate())
}
