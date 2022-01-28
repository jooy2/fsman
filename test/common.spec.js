import assert from 'assert';
import fsman from '../dist/index.js';

describe('fsman', () => {
  it('isHidden', async () => {
    assert.strictEqual(await fsman.isHidden('/home/user/Desktop/hello.txt'), false);
    assert.strictEqual(await fsman.isHidden('~/.bash_profile'), true);
    assert.strictEqual(await fsman.isHidden('.zshrc'), true);
    assert.strictEqual(await fsman.isHidden('C:\\ProgramData', true), true);
    assert.strictEqual(await fsman.isHidden('C:\\Users', true), false);
  });

  it('humanizeSize', () => {
    assert.strictEqual(fsman.humanizeSize(0), '0 Bytes');
    assert.strictEqual(fsman.humanizeSize(1000000), '976.56 KB');
    assert.strictEqual(fsman.humanizeSize(100000000, 3), '95.367 MB');
  });

  it('joinPath', () => {
    assert.strictEqual(fsman.joinPath(true, 'C:\\', 'Windows', 'System32'), 'C:\\Windows\\System32');
    assert.strictEqual(fsman.joinPath(true, 'Users', 'test'), '\\Users\\test');
    assert.strictEqual(fsman.joinPath(true, 'C:\\Users\\test'), 'C:\\Users\\test');
    assert.strictEqual(fsman.joinPath(false, '/home', 'user', 'Desktop'), '/home/user/Desktop');
    assert.strictEqual(fsman.joinPath(false, 'home', '/user', '.bashrc'), '/home/user/.bashrc');
  });
});
