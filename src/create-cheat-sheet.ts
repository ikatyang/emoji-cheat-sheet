import $ = require('cheerio');
import request = require('request');

// tslint:disable-next-line:no-var-requires
const package_json = require('../package.json');

const repo_name = package_json.name;
const repo_author = package_json.author;

const uncategorized = 'Uncategorized';

const api_url = 'https://api.github.com/emojis';
const sheet_url = 'http://www.emoji-cheat-sheet.com';

const travis_repo_url = `https://travis-ci.org/${repo_author}/${repo_name}`;
const travis_badge_url = `https://travis-ci.org/${repo_author}/${repo_name}.svg?branch=master`;

const url_descriptions = [
  ['GitHub Emoji API', api_url],
  ['Emoji Cheat Sheet', sheet_url],
]
  .map(([site_name, site_url]) => `[${site_name}](${site_url})`)
  .join(' and ');

// tslint:disable-next-line:max-line-length
const description = `This cheat sheet is automatically generated from ${url_descriptions}`;

const toc_name = 'Table of Contents';

const top_name = 'top';
const top_href = '#table-of-contents';

const column_divisions = 2;

type Url = string;

export interface Urls {
  [site_name: string]: Url;
}

export interface EmojiTable {
  [category: string]: string[];
}

export async function create_cheat_sheet() {
  const api_html = await get_html(api_url);
  const sheet_html = await get_html(sheet_url);

  const api_emojis = Object.keys(JSON.parse(api_html));
  const emoji_table: EmojiTable = {};

  const $html = $.load(sheet_html).root();
  $html.find('h2').each((_outer_index, category_element) => {
    const emojis: string[] = [];
    const category = $(category_element).text();
    $html
      .find(`#emoji-${category.toLowerCase()} li .name`)
      .each((_inner_index, emoji_element) => {
        const emoji = $(emoji_element).text();
        const index = api_emojis.indexOf(emoji);
        if (index !== -1) {
          api_emojis.splice(index, 1);
          emojis.push(emoji);
        }
      });
    emoji_table[category] = emojis;
  });

  // istanbul ignore next
  if (api_emojis.length > 0) {
    emoji_table[uncategorized] = api_emojis;
  }

  return create_table(emoji_table);
}

function create_table(emoji_table: EmojiTable) {
  const categories = Object.keys(emoji_table);
  return format(`

    # ${repo_name}

    [![build](${travis_badge_url})](${travis_repo_url})

    ${description}

    ## ${toc_name}

    ${categories
      .map(category => `- [${category}](#${category.toLowerCase()})`)
      .join('\n')}

    ${categories
      .map(category => {
        const emojis = emoji_table[category];
        return format(`

          ### ${category}

          ${create_table_head()}
          ${create_table_content(emojis)}

        `);
      })
      .join('\n'.repeat(2))}

  `);
}

function create_table_content(emojis: string[]) {
  let table_content = '';
  for (let i = 0; i < emojis.length; i += column_divisions) {
    const row_emojis = emojis.slice(i, i + column_divisions);
    while (row_emojis.length < column_divisions) {
      row_emojis.push('');
    }
    table_content += `${format(`

    | [${top_name}](${top_href}) |${row_emojis
      .map(
        emoji => (emoji.length !== 0 ? ` :${emoji}: | \`:${emoji}:\` ` : ' | '),
      )
      .join(' | ')}|

    `)}\n`;
  }
  return table_content;
}

function create_table_head() {
  return format(`

  |   |${' ico | emoji |'.repeat(column_divisions)}
  | - |${' --- | ----- |'.repeat(column_divisions)}

  `);
}

function format(str: string) {
  return str.trim().replace(/^ +/gm, '');
}

async function get_html(url: string) {
  return new Promise<string>((resolve, reject) => {
    const options = { url };
    if (url === api_url) {
      Object.assign(options, {
        headers: {
          'User-Agent': 'https://github.com/ikatyang/emoji-cheat-sheet',
        },
      });
    }
    request.get(options, (error, response, html) => {
      // istanbul ignore next
      // tslint:disable-next-line:early-exit
      if (!error && response.statusCode === 200) {
        resolve(html);
      } else {
        const error_message = Boolean(error)
          ? error
          : `Unexpected response status code: ${response.statusCode}`;
        reject(error_message);
      }
    });
  });
}
