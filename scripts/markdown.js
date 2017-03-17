const format = str => str.trim().replace(/^ +/mg, '');

module.exports = class Markdown {

  static create(url, title, emojiTable, columnDivisions) {
    const emojiCatalogs = Object.keys(emojiTable);
    return format(`

      # ${title}

      This cheat sheet is auto-generated from <${url}> using [emoji-cheat-sheet-generator](https://github.com/ikatyang/emoji-cheat-sheet/tree/master).

      ## Table of Contents

      ${emojiCatalogs.map(catalog => `- [${catalog}](#${catalog.toLowerCase()})`).join('\n')}

      ${
        emojiCatalogs.map(catalog => {
          const emojis = emojiTable[catalog];
          return format(`

            ### ${catalog}

            ${this.createTable(emojis, columnDivisions)}

          `);
        }).join(('\n').repeat(2))
      }

    `);
  }

  static createTableHead(columnDivisions) {
    return format(`

    |   |${(' icon | emoji |').repeat(columnDivisions)}
    | - |${(' ---- | ----- |').repeat(columnDivisions)}

    `);
  }

  static createTable(emojis, columnDivisions) {
    let table = this.createTableHead(columnDivisions) + '\n';
    for (let i = 0; i < emojis.length; i += columnDivisions) {
      const rowEmojis = emojis.slice(i, i + columnDivisions);
      while (rowEmojis.length < columnDivisions)
        rowEmojis.push('');
      table += format(`

      | [top](#table-of-contents) |${rowEmojis.map((emoji) => ` :${emoji}: | \`:${emoji}:\` `).join(' | ')}|

      `) + '\n';
    }
    return table;
  }

};
