import assert from 'assert';
import fsman from '../dist/index.js';

describe('fsman', () => {
  it('isHidden', async () => {
    assert.strictEqual(await fsman.isHidden('/home/user/Desktop/hello.txt'), false);
    assert.strictEqual(await fsman.isHidden('~/.bash_profile'), true);
    assert.strictEqual(await fsman.isHidden('.zshrc'), true);
    assert.strictEqual(await fsman.isHidden('/home/user/Desktop/.hidden'), true);
    assert.strictEqual(await fsman.isHidden('/home/user/Desktop/.conf/config'), false);
    assert.strictEqual(await fsman.isHidden('/home/user/Desktop/.conf/.secret'), true);
    assert.strictEqual(await fsman.isHidden('C:\\ProgramData', true), true);
    assert.strictEqual(await fsman.isHidden('C:\\Users', true), false);
  });

  it('humanizeSize', () => {
    assert.strictEqual(fsman.humanizeSize(0), '0 Bytes');
    assert.strictEqual(fsman.humanizeSize(1000000), '976.56 KB');
    assert.strictEqual(fsman.humanizeSize(100000000, 3), '95.367 MB');
  });

  it('resolvePath', () => {
    assert.strictEqual(fsman.resolvePath('home'), '/home');
    assert.strictEqual(fsman.resolvePath('/home//test/'), '/home/test');
    assert.strictEqual(fsman.resolvePath('home/test/.conf'), '/home/test/.conf');
    assert.strictEqual(fsman.resolvePath('/'), '/');
    assert.strictEqual(fsman.resolvePath('C:\\\\Users\\test\\', true), 'C:\\Users\\test');
    assert.strictEqual(fsman.resolvePath('C:\\Users\\test\\.config', true), 'C:\\Users\\test\\.config');
    assert.strictEqual(fsman.resolvePath('\\Users\\test\\.config', true), '\\Users\\test\\.config');
    assert.strictEqual(fsman.resolvePath('C:', true), 'C:');
  });

  it('joinPath', () => {
    assert.strictEqual(fsman.joinPath(true, 'C:\\', 'Windows', 'System32'), 'C:\\Windows\\System32');
    assert.strictEqual(fsman.joinPath(true, 'Users', 'test'), '\\Users\\test');
    assert.strictEqual(fsman.joinPath(true, 'C:\\Users\\test'), 'C:\\Users\\test');
    assert.strictEqual(fsman.joinPath(false, '/home', 'user', 'Desktop'), '/home/user/Desktop');
    assert.strictEqual(fsman.joinPath(false, 'home', '/user', '.bashrc'), '/home/user/.bashrc');
  });
});
