import { get as getAttr } from 'winattr';
import {
  join, resolve as pathResolve, extname, basename, dirname, win32,
} from 'path';
import {
  statSync, mkdirSync, existsSync, createReadStream, renameSync,
  readdirSync, utimesSync, closeSync, rmSync, openSync,
} from 'fs';
import { createHash } from 'crypto';

export default class FsMan {
  static isHidden(filePath: string, isWindows = false) : Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (isWindows) {
        getAttr(filePath, (error: Error, data: Attributes) => {
          resolve(!error && data.hidden);
        });
      } else {
        resolve(/(^|\/)\.[^/.]/.test(filePath.split('/')?.pop() || '/'));
      }
    });
  }

  static humanizeSize(bytes: number, decimals = 2) : string {
    const sizeUnits = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    if (bytes < 1) {
      return `0 ${sizeUnits[0]}`;
    }

    const byteCalc = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${parseFloat((bytes / 1024 ** byteCalc).toFixed((decimals < 0 ? 0 : decimals)))} ${sizeUnits[byteCalc]}`;
  }

  static resolvePath(filePath: string, isWindows?: boolean) : string {
    if (isWindows) {
      let windowsPath = filePath;

      if (windowsPath.length > 2 && !/[a-zA-Z]:\\/.test(windowsPath)) {
        windowsPath = `\\${windowsPath}`;
      }

      if (windowsPath.length > 2 && /\\$/.test(windowsPath)) {
        windowsPath = windowsPath.replace(/\\$/, '');
      }

      return windowsPath
        .replace(/\\{2,}/g, '\\');
    }

    let unixPath : string = filePath;

    if (!/^\//.test(unixPath)) {
      unixPath = `/${unixPath}`;
    }

    unixPath = unixPath.replace(/\/{2,}/g, '/');

    if (unixPath.length > 1) {
      unixPath = unixPath.replace(/\/$/, '');
    }

    return unixPath;
  }

  static joinPath(isWindows: boolean, ...paths: string[]) : string {
    if (isWindows) {
      return this.resolvePath(join(...paths), true);
    }

    let fullPath = '';

    for (let i = 0, iLen = paths.length; i < iLen; i += 1) {
      fullPath = `${fullPath}/${paths[i]}`;
    }

    return this.resolvePath(fullPath, false);
  }

  static isValidFileName(filePath: string, unixType?: boolean) : boolean {
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

  static fileName(filePath: string, withExtension?: boolean) : string {
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

  static ext(filePath: string) : string {
    const strPath: string = extname(filePath) || filePath;

    if (strPath.indexOf('.') === -1) {
      return '';
    }

    return strPath.split('.')?.pop() || '';
  }

  static stat(filePath: string) : FileStat {
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
        modified: dateToUnixTime(fileItem.mtime),
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
      modified: -1,
    };
  }

  static mkdir(filePath: string, recursive = true) : void {
    try {
      if (!existsSync(filePath)) {
        mkdirSync(filePath, {
          recursive,
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
    }
  }

  static touch(filePath: string) : void {
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

  static rm(filePath: string) : void {
    if (!filePath) {
      return;
    }

    try {
      if (existsSync(filePath)) {
        rmSync(filePath, {
          recursive: true,
          force: true,
        });
      }
    } catch {
      // Do Nothing
    }
  }

  static mv(filePath: string, targetFilePath: string) : void {
    if (!filePath || !targetFilePath) {
      return;
    }

    renameSync(filePath, targetFilePath);
  }

  static empty(directoryPath: string) : void {
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

  static hash(filePath: string, algorithm: 'md5'|'sha1'|'sha256'|'sha512' = 'md5') : Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash(algorithm);
      const stream = createReadStream(filePath);

      stream.on('error', (err: Error) => {
        reject(err);
      });

      stream.on('data', (chunk: Buffer|string) => {
        hash.update(chunk);
      });

      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
    });
  }
}
