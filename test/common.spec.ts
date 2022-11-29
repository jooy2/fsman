import assert from 'assert';
import {
	isHidden,
	humanizeSize,
	resolvePath,
	joinPath,
	isValidFileName,
	fileName,
	normalize,
	ext,
	stat,
	head,
	touch,
	rm,
	mv,
	empty,
	hash
} from '../dist';

const IS_WINDOWS_OS = process.platform === 'win32';

describe('fsman', () => {
	it('isHidden', async () => {
		assert.strictEqual(await isHidden('/home/user/Desktop/hello.txt'), false);
		assert.strictEqual(await isHidden('~/.bash_profile'), true);
		assert.strictEqual(await isHidden('.zshrc'), true);
		assert.strictEqual(await isHidden('/home/user/Desktop/.hidden'), true);
		assert.strictEqual(await isHidden('/home/user/Desktop/.conf/config'), false);
		assert.strictEqual(await isHidden('/home/user/Desktop/.conf/.secret'), true);
		if (IS_WINDOWS_OS) {
			assert.strictEqual(await isHidden('C:\\ProgramData', true), true);
			assert.strictEqual(await isHidden('C:\\Users', true), false);
		}
	});

	it('humanizeSize', (done) => {
		assert.strictEqual(humanizeSize(0), '0 Bytes');
		assert.strictEqual(humanizeSize(1000000), '976.56 KB');
		assert.strictEqual(humanizeSize(100000000, 3), '95.367 MB');
		done();
	});

	it('resolvePath', (done) => {
		assert.strictEqual(resolvePath('home'), '/home');
		assert.strictEqual(resolvePath('/home//test/'), '/home/test');
		assert.strictEqual(resolvePath('home/test/.conf'), '/home/test/.conf');
		assert.strictEqual(resolvePath('/'), '/');
		assert.strictEqual(resolvePath('C:\\\\Users\\test\\', true), 'C:\\Users\\test');
		assert.strictEqual(resolvePath('C:\\Users\\test\\.config', true), 'C:\\Users\\test\\.config');
		assert.strictEqual(resolvePath('\\Users\\test\\.config', true), '\\Users\\test\\.config');
		assert.strictEqual(resolvePath('C:', true), 'C:');
		done();
	});

	it('joinPath', (done) => {
		assert.strictEqual(joinPath(true, 'C:\\', 'Windows', 'System32'), 'C:\\Windows\\System32');
		assert.strictEqual(joinPath(true, 'Users', 'test'), '\\Users\\test');
		assert.strictEqual(joinPath(true, 'C:\\Users\\test'), 'C:\\Users\\test');
		assert.strictEqual(joinPath(false, '/home', 'user', 'Desktop'), '/home/user/Desktop');
		assert.strictEqual(joinPath(false, 'home', '/user', '.bashrc'), '/home/user/.bashrc');
		done();
	});

	it('isValidFileName', (done) => {
		assert.strictEqual(isValidFileName('System32'), true);
		assert.strictEqual(isValidFileName('.example', true), true);
		assert.strictEqual(isValidFileName('hello.:txt', true), true);
		assert.strictEqual(isValidFileName('C:\\Windows\\System32'), true);
		assert.strictEqual(isValidFileName('C:\\Users\\test\\Desktop\\hello.txt'), true);
		assert.strictEqual(isValidFileName('C:\\Users\\test\\Desktop\\hello*'), false);
		assert.strictEqual(isValidFileName('C:\\Users\\test\\Desktop\\hello!@#$%^&*()_+-:='), false);
		assert.strictEqual(isValidFileName('hello!@#$%^&*()_+-:=', true), false);
		assert.strictEqual(isValidFileName('/home/test/Desktop/test/.example', true), true);
		assert.strictEqual(isValidFileName('/home/test/Desktop/test/text.txt', true), true);
		assert.strictEqual(isValidFileName('/home/test/Desktop/test/hi!@#$%^&*()_+-=', true), true);
		assert.strictEqual(isValidFileName('/home/test/Desktop/test/*hi', true), true);
		assert.strictEqual(
			isValidFileName(
				'/home/test/Desktop/test/0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345'
			),
			false
		); // 256
		assert.strictEqual(
			isValidFileName(
				'/home/test/Desktop/test/012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234',
				true
			),
			true
		); // 255
		done();
	});

	it('hash', async () => {
		const hashTable = IS_WINDOWS_OS
			? {
					md5: '239884dde2b4354613a228001b22d9b9',
					sha1: '38851813f75627d581c593f3ccfb7061dd013fbd',
					sha256: 'db42a58ad98348dc8647ef27054ffcab994a2359fe9e0daeeffe8cbfe2409583',
					sha512:
						'c0be4b1ff1aba7be9b02d619dd10e0bdfa4149cf0f241320fe237336aea286ff68c3f42fae4d707a1a59dc6a269e730d3bc4b9891347647bb5acb82b5792a503'
			  }
			: {
					md5: '192ef428bd3e3413262df05679cee825',
					sha1: '2accd3e31a50c5ed9c6786ef34669bbda55d7156',
					sha256: '568770a759ef55df5c2a5d3cbfc5c62e2ade6a353c391037d91a97212dec9e88',
					sha512:
						'b03187c2962c947de2d5d3cdaa2f25e5e1df31c5190cccf42d03759d042dd5f5a2773ca9903e122b6faaf4a53b45c419d605464abb83cbe578ed249cb558844a'
			  };

		assert.strictEqual(await hash('test/targets/STATIC_FILE.txt'), hashTable.md5);
		assert.strictEqual(await hash('test/targets/STATIC_FILE.txt', 'sha1'), hashTable.sha1);
		assert.strictEqual(await hash('test/targets/STATIC_FILE.txt', 'sha256'), hashTable.sha256);
		assert.strictEqual(await hash('test/targets/STATIC_FILE.txt', 'sha512'), hashTable.sha512);
	});

	it('ext', (done) => {
		assert.strictEqual(ext('test/sample.txt'), 'txt');
		assert.strictEqual(ext('test.txt.sample'), 'sample');
		assert.strictEqual(ext('test'), '');
		done();
	});

	it('fileName', (done) => {
		assert.strictEqual(fileName('test/sample.txt'), 'sample');
		assert.strictEqual(fileName('test/sample.txt.sample'), 'sample.txt');
		assert.strictEqual(fileName('test/sample.txt', true), 'sample.txt');
		assert.strictEqual(fileName('C:\\Users\\user\\Desktop\\hello.txt'), 'hello');
		assert.strictEqual(fileName('C:\\Users\\user\\Desktop\\hello.txt', true), 'hello.txt');
		assert.strictEqual(fileName('test'), 'test');
		done();
	});

	it('normalize', (done) => {
		const NFD = '안녕하세요_12345-ABCDE'.normalize('NFD'); // macOS
		const NFC = '안녕하세요_12345-ABCDE'.normalize('NFC'); // Windows

		assert.strictEqual(normalize(NFD, 'w'), NFC);
		assert.strictEqual(normalize(NFC, 'm'), NFD);
		done();
	});

	it('stat', (done) => {
		assert(stat('test/targets/STATIC_FILE.txt'));
		assert(stat('test'));
		done();
	});

	it('head', (done) => {
		assert.strictEqual(head('test/targets/hello.md'), '# Hello, World!');
		assert.strictEqual(head('test/targets/hello.md', 1), '# Hello, World!');
		assert.strictEqual(
			head('test/targets/hello.md', 4),
			'# Hello, World!\n\nThis is Hello File.\n'
		);
		done();
	});

	it('touch', (done) => {
		touch('./__TEST__TOUCH_FILE.txt');
		done();
	});

	it('rm', (done) => {
		rm('./__TEST__TOUCH_FILE.txt');
		done();
	});

	it('mv', (done) => {
		mv('test/targets/MV_TEST.txt', 'test/targets/MV_TEST_1.txt');
		mv('test/targets/MV_TEST_1.txt', 'test/targets/MV_TEST.txt');
		done();
	});

	it('empty', (done) => {
		empty('test/targets/EMPTY');
		done();
	});
});
