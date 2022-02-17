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
        const fileName : string = filePath.split('/')?.pop() || '/';
        resolve(/(^|\/)\.[^/.]/.test(fileName));
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
}
