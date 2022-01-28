import winattr from 'winattr';
import path from 'path';

export default class fsman {
  static isHidden(filePath: string, isWindows = false) : Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (isWindows) {
        winattr.get(filePath, (error: Error, data: Attributes) => {
          resolve(!error && data.hidden);
        });
      } else {
        resolve(/(^|\/)\.[^/.]/.test(filePath));
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

  static resolvePath(filePath: string, isWindows: boolean) : string {
    if (isWindows) {
      let windowsPath = filePath;
      if (!/[a-zA-Z]:\\/.test(windowsPath)) {
        windowsPath = `\\${windowsPath}`;
      }
      return windowsPath
        .replace(/\\{2,}/g, '\\')
        .replace(/\\$/, '');
    }
    let unixPath = filePath;
    if (!/^\//.test(unixPath)) {
      unixPath = `/${unixPath}`;
    }
    return unixPath
      .replace(/\/{2,}/g, '/')
      .replace(/\/$/, '');
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
}
