const assert = require('assert');
const fsman = require('../src');

describe('Array', () => {
  it('isHidden', async () => {
    assert.strictEqual(await fsman.isHidden('/home/user/Desktop/hello.txt'), false);
    assert.strictEqual(await fsman.isHidden('~/.bash_profile'), true);
    assert.strictEqual(await fsman.isHidden('.zshrc'), true);
    assert.strictEqual(await fsman.isHidden('C:\\ProgramData', true), true);
    assert.strictEqual(await fsman.isHidden('C:\\Users', true), false);
  });
});
