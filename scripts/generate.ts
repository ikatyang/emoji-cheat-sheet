import * as fs from 'fs';
import {create_cheat_sheet} from '../src/create-cheat-sheet';

const output_filename = process.argv[2];
if (output_filename === undefined) {
  throw new Error(`Usage ts-node path/to/generate.ts path/to/output.md`);
}

create_cheat_sheet().then(cheat_sheet => {
  fs.writeFileSync(output_filename, cheat_sheet, 'utf8');
});
