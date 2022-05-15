import winattr from 'winattr';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export default class fsman {
  static isHidden(filePath: string, isWindows = false) : Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (isWindows) {
        winattr.get(filePath, (error: Error, data: Attributes) => {
          resolve(!error && data.hidden);
        });
      } else {
        resolve(/(^|\/)\.[^/.]/.test(filePath.split('/')?.pop() || '/'));
      }
    });
  }

  static humanizeSize(bytes: number, decimals = 2) : string {
    if (bytes < 1) {
      return '0 Bytes';
    }
    const byteCalc = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / 1024 ** byteCalc).toFixed((decimals < 0 ? 0 : decimals)))} ${['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][byteCalc]}`;
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
      return this.resolvePath(path.join(...paths), true);
    }
    let fullPath = '';
    for (let i = 0, iLen = paths.length; i < iLen; i += 1) {
      fullPath = `${fullPath}/${paths[i]}`;
    }
    return this.resolvePath(fullPath, false);
  }

  static isValidFileName(filePath: string, unixType?: boolean) : boolean {
    let fileNameRegex;
    const fileName = path.basename(filePath);

    if (unixType) {
      fileNameRegex = /(^\s+$)|(^\.+$)|([:/]+)/;
    } else {
      // Windows
      fileNameRegex = /(^\s+$)|(^\.+$)|([<>:"/\\|?*]+)/;
    }

    return !fileNameRegex.test(fileName) && fileName.length <= 255;
  }

  static mkdir(filePath: string, recursive = true) : void {
    try {
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive });
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
    }
  }

  static hash(filePath: string, algorithm: 'md5'|'sha1'|'sha256'|'sha512' = 'md5') : Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm);
      const stream = fs.createReadStream(filePath);

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
