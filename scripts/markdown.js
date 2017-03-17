const format = str => str.trim().replace(/^ +/mg, '');

module.exports = class Markdown {

  static create(title, emojiTable, columnDivisions) {
    return format(`

      # ${title}

      ${
        Object.keys(emojiTable).map(catalog => {
          const emojis = emojiTable[catalog];
          return format(`

            #### ${catalog}

            ${this.createTable(emojis, columnDivisions)}

          `);
        }).join(('\n').repeat(2))
      }

    `);
  }

  static createTableHead(columnDivisions) {
    return format(`

    |${(' icon | emoji |').repeat(columnDivisions)}
    |${(' ---- | ----- |').repeat(columnDivisions)}

    `);
  }

  static createTable(emojis, columnDivisions) {
    let table = this.createTableHead(columnDivisions) + '\n';
    for (let i = 0; i < emojis.length; i += columnDivisions) {
      const rowEmojis = emojis.slice(i, i + columnDivisions);
      while (rowEmojis.length < columnDivisions)
        rowEmojis.push('');
      table += format(`

      |${rowEmojis.map((emoji) => ` :${emoji}: | \`:${emoji}:\` `).join(' | ')}|

      `) + '\n';
    }
    return table;
  }

};
