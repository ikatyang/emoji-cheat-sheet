#!/bin/env node

const fs = require('fs');
const path = require('path');
const $ = require('cheerio');
const request = require('request');
const markdown = require('./markdown');

const url = 'http://www.emoji-cheat-sheet.com';
const title = 'emoji-cheat-sheet';

const outDir = path.resolve(process.cwd(), './generated');
const outFile = path.join(outDir, 'README.md');

const columnDivisions = 2;

request.get(url, (error, response, body) => {
  if (error || response.statusCode !== 200) {
    throw error || `Unexpected response status code: ${response.statusCode}`;
  } else {
    const emojiTable = {};
    const $html = $.load(body).root();
    $html.find('h2').each((_, catalogElement) => {
      const emojis = [];
      const catalog = $(catalogElement).text();
      $html.find(`#emoji-${catalog.toLowerCase()} li .name`).each((_, emojiElement) => {
        const emoji = $(emojiElement).text();
        emojis.push(emoji);
      });
      emojiTable[catalog] = emojis;
    });
    if (fs.existsSync(outDir)) {
      if (!fs.statSync(outDir).isDirectory()) {
        throw `OutDir '${outDir}' should be a directory.`;
      }
    } else {
      fs.mkdirSync(outDir);
    }
    fs.writeFileSync(outFile, markdown.create(title, emojiTable, columnDivisions));
  }
});
