import {create_cheat_sheet} from './create-cheat-sheet';

test('create-cheat-sheet', async () => {
  const cheat_sheet = await create_cheat_sheet();
  expect(cheat_sheet).toMatchSnapshot();
});
