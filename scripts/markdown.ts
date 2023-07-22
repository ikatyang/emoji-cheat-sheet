import { name as repoName, repository } from '../package.json'

const RESOURCE_1 = '[GitHub Emoji API](https://api.github.com/emojis)'
const RESOURCE_2 =
  '[Unicode Full Emoji List](https://unicode.org/emoji/charts/full-emoji-list.html)'

const COLUMNS = 2

const TOC_NAME = 'Table of Contents'

type GithubEmojiIds = Array<string[]>

export function generateCheatSheet(categorizedGithubEmojiIds: {
  [category: string]: { [subCategory: string]: GithubEmojiIds }
}) {
  const lineTexts = []

  lineTexts.push(`# ${repoName}`)
  lineTexts.push('')

  lineTexts.push(
    `[![Up to Date](https://github.com/${repository}/workflows/Up%20to%20Date/badge.svg)](https://github.com/${repository}/actions?query=workflow%3A%22Up+to+Date%22)`,
  )
  lineTexts.push('')

  lineTexts.push(
    `This cheat sheet is automatically generated from ${RESOURCE_1} and ${RESOURCE_2}.`,
  )
  lineTexts.push('')

  const categories = Object.keys(categorizedGithubEmojiIds)

  lineTexts.push(`## ${TOC_NAME}`)
  lineTexts.push('')
  lineTexts.push(...generateToc(categories))
  lineTexts.push('')

  for (const category of categories) {
    lineTexts.push(`### ${category}`)
    lineTexts.push('')

    const subCategorizedGithubEmojiIds = categorizedGithubEmojiIds[category]
    const subCategories = Object.keys(subCategorizedGithubEmojiIds)
    if (subCategories.length > 1) {
      lineTexts.push(...generateToc(subCategories))
      lineTexts.push('')
    }

    for (const subCategory of subCategories) {
      if (subCategory) {
        lineTexts.push(`#### ${subCategory}`)
        lineTexts.push('')
      }

      lineTexts.push(
        ...generateTable(
          subCategorizedGithubEmojiIds[subCategory],
          `[top](#${getHeaderId(category)})`,
          `[top](#${getHeaderId(TOC_NAME)})`,
        ),
      )
      lineTexts.push('')
    }
  }

  return lineTexts.join('\n')
}

function generateToc(headers: string[]) {
  return headers.map(header => `- [${header}](#${getHeaderId(header)})`)
}

function getHeaderId(header: string) {
  return header
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function generateTable(
  githubEmojiIds: GithubEmojiIds,
  leftText: string,
  rightText: string,
) {
  const lineTexts = []

  let header = ''
  let delimiter = ''

  header += '| '
  delimiter += '| - '
  for (let i = 0; i < COLUMNS && i < githubEmojiIds.length; i++) {
    header += `| ico | shortcode `
    delimiter += '| :-: | - '
  }
  header += '| |'
  delimiter += '| - |'

  lineTexts.push(header, delimiter)

  for (let i = 0; i < githubEmojiIds.length; i += COLUMNS) {
    let lineText = `| ${leftText} `
    for (let j = 0; j < COLUMNS; j++) {
      if (i + j < githubEmojiIds.length) {
        const emojiIds = githubEmojiIds[i + j]
        const emojiId = emojiIds[0]
        lineText += `| :${emojiId}: | \`:${emojiId}:\` `
        for (let k = 1; k < emojiIds.length; k++) {
          lineText += `<br /> \`:${emojiIds[k]}:\` `
        }
      } else if (githubEmojiIds.length > COLUMNS) {
        lineText += '| | '
      }
    }
    lineText += `| ${rightText} |`
    lineTexts.push(lineText)
  }

  return lineTexts
}
