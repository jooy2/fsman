import winattr from 'winattr';

export default class fsman {
  static isHidden(path: string, isWindows = false) : Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (isWindows) {
        winattr.get(path, (error: Error, data: Attributes) => {
          resolve(!error && data.hidden);
        });
      } else {
        resolve(/(^|\/)\.[^/.]/.test(path));
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
}
