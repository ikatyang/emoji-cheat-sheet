#!/bin/env node

const fs = require('fs');
const path = require('path');
const $ = require('cheerio');
const request = require('request');
const markdown = require('./markdown');

const title = 'emoji-cheat-sheet';
const apiUrl = 'https://api.github.com/emojis';
const sheetUrl = 'http://www.emoji-cheat-sheet.com';

const outDir = path.resolve(process.cwd(), './generated');
const outFile = path.join(outDir, 'README.md');

const columnDivisions = 2;

const getHTML = (url) => new Promise((resolve, reject) => {
  const options = { url };
  if (url === apiUrl) {
    Object.assign(options, {
      headers: { 'User-Agent': 'https://github.com/ikatyang/emoji-cheat-sheet' },
    });
  }
  request.get(options, (error, response, html) => {
    if (error || response.statusCode !== 200) {
      reject(error || `Unexpected response status code: ${response.statusCode}`);
    } else {
      resolve(html);
    }
  });
});

Promise.all([getHTML(apiUrl), getHTML(sheetUrl)]).then(([apiHTML, sheetHTML]) => {
  const apiEmojis = Object.keys(JSON.parse(apiHTML));
  const emojiTable = {};
  const $html = $.load(sheetHTML).root();
  $html.find('h2').each((_, categoryElement) => {
    const emojis = [];
    const category = $(categoryElement).text();
    $html.find(`#emoji-${category.toLowerCase()} li .name`).each((_, emojiElement) => {
      const emoji = $(emojiElement).text();
      const index = apiEmojis.indexOf(emoji);
      if (index !== -1) {
        apiEmojis.splice(index, 1);
        emojis.push(emoji);
      }
    });
    emojiTable[category] = emojis;
  });
  if (apiEmojis.length > 0) {
    emojiTable['Uncategorized'] = apiEmojis;
  }
  if (fs.existsSync(outDir)) {
    if (!fs.statSync(outDir).isDirectory()) {
      throw `OutDir '${outDir}' should be a directory.`;
    }
  } else {
    fs.mkdirSync(outDir);
  }
  fs.writeFileSync(outFile, markdown.create({
    'GitHub Emoji API': apiUrl,
    'Emoji Cheat Sheet': sheetUrl,
  }, title, emojiTable, columnDivisions));
});
