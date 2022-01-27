import winattr = require('winattr');

export function isHidden(path: string, isWindows = false) : Promise<boolean> {
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

export default {};
