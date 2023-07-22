type EmojiLiteral = string

async function getGithubEmojiIdMap(): Promise<{
  [githubEmojiId: string]: EmojiLiteral | [string]
}> {
  return Object.fromEntries(
    Object.entries(
      await fetchJson<{ [id: string]: string }>(
        'https://api.github.com/emojis',
        {
          headers: {
            'User-Agent': 'https://github.com/ikatyang/emoji-cheat-sheet',
          },
        },
      ),
    ).map(([id, url]) => [
      id,
      url.includes('/unicode/')
        ? getLast(url.split('/'))
            .split('.png')[0]
            .split('-')
            .map(codePointText =>
              String.fromCodePoint(Number.parseInt(codePointText, 16)),
            )
            .join('')
        : [getLast(url.split('/')).split('.png')[0]], // github's custom emoji
    ]),
  )
}

async function getUnicodeEmojiCategoryIterator() {
  return getUnicodeEmojiCategoryIteratorFromText(
    await fetchText('https://unicode.org/emoji/charts/full-emoji-list.txt'),
  )
}

function* getUnicodeEmojiCategoryIteratorFromText(text: string) {
  const lines = text.split('\n')
  for (const line of lines) {
    if (line.startsWith('@@')) {
      const value = line.substring(2)
      yield { type: 'category', value }
    } else if (line.startsWith('@')) {
      const value = line.substring(1)
      yield { type: 'subcategory', value }
    } else if (line.length) {
      const value = line
        .split('\t')[0]
        .split(' ')
        .map(_ => String.fromCodePoint(parseInt(_, 16)))
        .join('')
      yield { type: 'emoji', value }
    }
  }
}

export async function getCategorizeGithubEmojiIds() {
  const githubEmojiIdMap = await getGithubEmojiIdMap()
  const emojiLiteralToGithubEmojiIdsMap: {
    [emojiLiteral: string]: string[]
  } = {}
  const githubSpecificEmojiUriToGithubEmojiIdsMap: {
    [githubSpecificEmojiUri: string]: string[]
  } = {}
  for (const [emojiId, emojiLiteral] of Object.entries(githubEmojiIdMap)) {
    if (Array.isArray(emojiLiteral)) {
      const [uri] = emojiLiteral
      if (!githubSpecificEmojiUriToGithubEmojiIdsMap[uri]) {
        githubSpecificEmojiUriToGithubEmojiIdsMap[uri] = []
      }
      githubSpecificEmojiUriToGithubEmojiIdsMap[uri].push(emojiId)
      delete githubEmojiIdMap[emojiId]
      continue
    }
    if (!emojiLiteralToGithubEmojiIdsMap[emojiLiteral]) {
      emojiLiteralToGithubEmojiIdsMap[emojiLiteral] = []
    }
    emojiLiteralToGithubEmojiIdsMap[emojiLiteral].push(emojiId)
  }
  const categorizedEmojiIds: {
    [category: string]: { [subcategory: string]: Array<string[]> }
  } = {}
  const categoryStack = []
  for (const { type, value } of await getUnicodeEmojiCategoryIterator()) {
    switch (type) {
      case 'category': {
        while (categoryStack.length) categoryStack.pop()
        const title = toTitleCase(value)
        categoryStack.push(title)
        categorizedEmojiIds[title] = {}
        break
      }
      case 'subcategory': {
        if (categoryStack.length > 1) categoryStack.pop()
        const title = toTitleCase(value)
        categoryStack.push(title)
        categorizedEmojiIds[categoryStack[0]][title] = []
        break
      }
      case 'emoji': {
        const key = value.replace(/[\ufe00-\ufe0f\u200d]/g, '')
        if (key in emojiLiteralToGithubEmojiIdsMap) {
          const githubEmojiIds = emojiLiteralToGithubEmojiIdsMap[key]
          const [category, subcategory] = categoryStack
          categorizedEmojiIds[category][subcategory].push(githubEmojiIds)
          for (const githubEmojiId of githubEmojiIds) {
            delete githubEmojiIdMap[githubEmojiId]
          }
        }
        break
      }
      default:
        throw new Error(`Unexpected type ${JSON.stringify(type)}`)
    }
  }
  if (Object.keys(githubEmojiIdMap).length) {
    throw new Error(`Uncategorized emoji(s) found.`)
  }
  for (const category of Object.keys(categorizedEmojiIds)) {
    const subCategorizedEmojiIds = categorizedEmojiIds[category]
    const subcategories = Object.keys(subCategorizedEmojiIds)
    for (const subcategory of subcategories) {
      if (subCategorizedEmojiIds[subcategory].length === 0) {
        delete subCategorizedEmojiIds[subcategory]
      }
    }
    if (Object.keys(subCategorizedEmojiIds).length === 0) {
      delete categorizedEmojiIds[category]
    }
  }
  if (Object.keys(githubSpecificEmojiUriToGithubEmojiIdsMap).length) {
    categorizedEmojiIds['GitHub Custom Emoji'] = {
      '': Object.entries(githubSpecificEmojiUriToGithubEmojiIdsMap).map(
        ([, v]) => v,
      ),
    }
  }
  return categorizedEmojiIds
}

function toTitleCase(text: string) {
  return text
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[a-zA-Z]+/g, word => word[0].toUpperCase() + word.slice(1))
}

function getLast<T>(array: T[]) {
  return array[array.length - 1]
}

async function fetchJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init)
  return (await response.json()) as T
}

async function fetchText(url: string, init?: RequestInit) {
  const response = await fetch(url, init)
  return await response.text()
}
