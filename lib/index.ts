import { exec } from 'child_process';
import { join, resolve as pathResolve, extname, basename, dirname, win32, posix } from 'path';
import {
	statSync,
	mkdirSync,
	existsSync,
	createReadStream,
	renameSync,
	readdirSync,
	utimesSync,
	closeSync,
	rmSync,
	openSync,
	readFileSync,
	writeSync
} from 'fs';
import { createHash } from 'crypto';

interface FileStat {
	success: boolean;
	isDirectory: boolean;
	size: number;
	sizeHumanized: string;
	name: string;
	dirname: string;
	path: string;
	ext: string;
	created: number;
	modified: number;
}

export default class FsMan {
	static isHidden(filePath: string, isWindows = false): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			if (isWindows) {
				exec(`attrib "${filePath}"`, (error, stdout, stderr) => {
					if (error || stderr || !stdout) {
						resolve(false);
						return;
					}
					resolve(stdout.replace(filePath, '').includes('H'));
				});
			} else {
				resolve(/(^|\/)\.[^/.]/.test(filePath.split('/')?.pop() || '/'));
			}
		});
	}

	static humanizeSize(bytes: number, decimals = 2): string {
		const sizeUnits = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		if (bytes < 1) {
			return `0 ${sizeUnits[0]}`;
		}

		const byteCalc = Math.floor(Math.log(bytes) / Math.log(1024));

		return `${parseFloat((bytes / 1024 ** byteCalc).toFixed(decimals < 0 ? 0 : decimals))} ${
			sizeUnits[byteCalc]
		}`;
	}

	static resolvePath(filePath: string, isWindows?: boolean): string {
		if (isWindows) {
			let windowsPath = filePath;

			if (windowsPath.length > 2 && !/[a-zA-Z]:\\/.test(windowsPath)) {
				windowsPath = `\\${windowsPath}`;
			}

			if (windowsPath.length > 2 && /\\$/.test(windowsPath)) {
				windowsPath = windowsPath.replace(/\\$/, '');
			}

			return windowsPath.replace(/\\{2,}/g, '\\');
		}

		let unixPath: string = filePath;

		if (!/^\//.test(unixPath)) {
			unixPath = `/${unixPath}`;
		}

		unixPath = unixPath.replace(/\/{2,}/g, '/');

		if (unixPath.length > 1) {
			unixPath = unixPath.replace(/\/$/, '');
		}

		return unixPath;
	}

	static joinPath(isWindows: boolean, ...paths: string[]): string {
		if (isWindows) {
			return FsMan.resolvePath(isWindows ? win32.join(...paths) : join(...paths), true);
		}

		let fullPath = '';

		for (let i = 0, iLen = paths.length; i < iLen; i += 1) {
			fullPath = `${fullPath}/${paths[i]}`;
		}

		return FsMan.resolvePath(fullPath, false);
	}

	static getPathLevel(filePath: string): number {
		if (!filePath) {
			return -1;
		}

		if (filePath === '/') {
			return 1;
		}

		return FsMan.toPosixPath(filePath.replace(/\\+$/, '')).split(posix.sep).length;
	}

	static toPosixPath(filePath: string): string {
		return filePath
			.replace(/^\\\\\?\\/, '')
			.replace(/\\/g, '/')
			.replace(/\/\/+/g, '/');
	}

	static isValidFileName(filePath: string, unixType?: boolean): boolean {
		let fileNameRegex;
		const fileName = FsMan.fileName(filePath);

		if (unixType) {
			fileNameRegex = /(^\s+$)|(^\.+$)|([:/]+)/;
		} else {
			// Windows
			fileNameRegex = /(^\s+$)|(^\.+$)|([<>:"/\\|?*]+)/;
		}

		return !fileNameRegex.test(fileName) && fileName.length <= 255;
	}

	static fileName(filePath: string, withExtension?: boolean): string {
		if (!filePath) {
			return '';
		}

		if (filePath.indexOf('/') === -1 && filePath.indexOf('\\') !== -1) {
			// Windows path
			if (withExtension) {
				return win32.basename(filePath);
			}

			return win32.basename(filePath, extname(filePath));
		}

		if (withExtension) {
			return basename(filePath);
		}
		return basename(filePath, extname(filePath));
	}

	// NFD - macOS
	// NFC - Windows
	static normalize(
		filePath: string,
		normalizationForm?: 'NFD' | 'NFC' | 'NFKC' | 'NFKD' | undefined
	): string {
		if (!filePath || filePath.length < 1) {
			return '';
		}

		return filePath.normalize(normalizationForm);
	}

	static ext(filePath: string, isWindows?: boolean): string {
		let strPath: string | undefined = filePath.split(isWindows ? '\\' : '/').pop();

		if (!strPath) {
			return '';
		}

		strPath = extname(strPath) || strPath;

		if (strPath.indexOf('.') === -1) {
			return '';
		}

		return strPath.split('.')?.pop()?.toLowerCase() || '';
	}

	static stat(filePath: string): FileStat {
		const dateToUnixTime = (date: Date) => Math.floor(new Date(date).getTime() / 1000);

		try {
			const fileItem = statSync(filePath);

			return {
				success: true,
				isDirectory: fileItem.isDirectory(),
				ext: FsMan.ext(filePath),
				size: fileItem.size,
				sizeHumanized: FsMan.humanizeSize(fileItem.size),
				name: FsMan.fileName(filePath),
				dirname: dirname(filePath),
				path: pathResolve(filePath),
				created: dateToUnixTime(fileItem.ctime),
				modified: dateToUnixTime(fileItem.mtime)
			};
		} catch (err) {
			if (err instanceof Error) {
				throw new Error(err.message);
			}
		}

		return {
			success: false,
			isDirectory: false,
			ext: '',
			size: 0,
			sizeHumanized: '0 Bytes',
			name: 'unknown',
			dirname: dirname(filePath),
			path: filePath,
			created: -1,
			modified: -1
		};
	}

	static head(filePath: string, length = 1): string | null {
		try {
			const content = readFileSync(filePath, 'utf-8');
			const contentByLine = content.split('\n');
			let result = '';

			for (let i = 0, len = length; i < len; i += 1) {
				result += `${contentByLine[i]}${length < 2 || i === len - 1 ? '' : '\n'}`;
			}

			return result.length < 1 ? null : result;
		} catch (err) {
			if (err instanceof Error) {
				throw new Error(err.message);
			}
		}
		return null;
	}

	static tail(filePath: string, length = 1): string | null {
		try {
			const content = readFileSync(filePath, 'utf-8');
			const contentByLine = content.split('\n');
			let result = '';

			if (contentByLine[contentByLine.length - 1].length < 1) {
				contentByLine.pop();
			}

			for (let i = contentByLine.length, len = contentByLine.length - length; i > len; i -= 1) {
				result = `${contentByLine[i - 1]}${
					result.length < 1 || i - 1 === len ? '' : '\n'
				}${result}`;
			}

			return result.length < 1 ? null : result;
		} catch (err) {
			if (err instanceof Error) {
				throw new Error(err.message);
			}
		}
		return null;
	}

	static mkdir(filePath: string, recursive = true): void {
		try {
			if (!existsSync(filePath)) {
				mkdirSync(filePath, {
					recursive
				});
			}
		} catch (err) {
			if (err instanceof Error) {
				throw new Error(err.message);
			}
		}
	}

	static touch(filePath: string): void {
		if (!filePath) {
			return;
		}

		const date: Date = new Date();

		try {
			utimesSync(filePath, date, date);
		} catch (err) {
			closeSync(openSync(filePath, 'a'));
		}
	}

	static touchDummy(filePath: string, size: number): Promise<boolean> {
		return new Promise((resolve, reject) => {
			if (!size || size < 0) {
				reject(new Error('Size is required'));
				return;
			}

			if (size === 0) {
				FsMan.touch(filePath);
				resolve(true);
				return;
			}

			try {
				const data = openSync(filePath, 'w');

				writeSync(data, Buffer.alloc(1), 0, 1, size - 1);
				closeSync(data);

				resolve(true);
			} catch (err) {
				reject(err);
			}
		});
	}

	static rm(filePath: string): void {
		if (!filePath) {
			return;
		}

		try {
			if (existsSync(filePath)) {
				rmSync(filePath, {
					recursive: true,
					force: true
				});
			}
		} catch {
			// Do Nothing
		}
	}

	static mv(filePath: string, targetFilePath: string): void {
		if (!filePath || !targetFilePath) {
			return;
		}

		renameSync(filePath, targetFilePath);
	}

	static empty(directoryPath: string): void {
		let fileItems: Array<string> = [];
		try {
			fileItems = readdirSync(directoryPath);
		} catch {
			// Do nothing
		}

		const fileItemLength: number = fileItems.length;

		for (let i = 0; i < fileItemLength; i += 1) {
			FsMan.rm(join(directoryPath, fileItems[i]));
		}
	}

	static hash(
		filePath: string,
		algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' = 'md5'
	): Promise<string> {
		return new Promise((resolve, reject) => {
			if (!filePath) {
				reject(new Error('Invalid path'));
				return;
			}

			const hashHandler = createHash(algorithm);
			const stream = createReadStream(filePath);

			stream.on('error', (err: Error) => {
				reject(err);
			});

			stream.on('data', (chunk: Buffer | string) => {
				hashHandler.update(chunk);
			});

			stream.on('end', () => {
				resolve(hashHandler.digest('hex'));
			});
		});
	}
}

export { FsMan };

export const {
	isHidden,
	humanizeSize,
	resolvePath,
	joinPath,
	getPathLevel,
	toPosixPath,
	isValidFileName,
	fileName,
	normalize,
	ext,
	stat,
	head,
	tail,
	mkdir,
	touch,
	touchDummy,
	rm,
	mv,
	empty,
	hash
} = FsMan;
