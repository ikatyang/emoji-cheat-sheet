const format = str => str.trim().replace(/^ +/mg, '');

module.exports = class Markdown {

  static create(urls, title, emojiTable, columnDivisions) {
    const categories = Object.keys(emojiTable);
    const urlDescriptions = Object.keys(urls).map((site) => `[${site}](${urls[site]})`).join(' and ');
    return format(`

      # ${title}

      This cheat sheet is auto-generated from ${urlDescriptions} using [emoji-cheat-sheet-generator](https://github.com/ikatyang/emoji-cheat-sheet/tree/master).

      ## Table of Contents

      ${categories.map(category => `- [${category}](#${category.toLowerCase()})`).join('\n')}

      ${
        categories.map(category => {
          const emojis = emojiTable[category];
          return format(`

            ### ${category}

            ${this.createTable(emojis, columnDivisions)}

          `);
        }).join(('\n').repeat(2))
      }

    `);
  }

  static createTableHead(columnDivisions) {
    return format(`

    |   |${(' ico | emoji |').repeat(columnDivisions)}
    | - |${(' --- | ----- |').repeat(columnDivisions)}

    `);
  }

  static createTable(emojis, columnDivisions) {
    let table = this.createTableHead(columnDivisions) + '\n';
    for (let i = 0; i < emojis.length; i += columnDivisions) {
      const rowEmojis = emojis.slice(i, i + columnDivisions);
      while (rowEmojis.length < columnDivisions)
        rowEmojis.push('');
      table += format(`

      | [top](#table-of-contents) |${rowEmojis.map((emoji) => emoji ? ` :${emoji}: | \`:${emoji}:\` ` : ' | ').join(' | ')}|

      `) + '\n';
    }
    return table;
  }

};
