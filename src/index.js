const winattr = require('winattr');

const isHidden = (path, isWindows) => new Promise(resolve => {
  if (isWindows) {
    winattr.get(path, (error, data) => {
      resolve(!error && data.hidden);
    });
  } else {
    resolve(/(^|\/)\.[^/.]/.test(path));
  }
});

module.exports = {
  isHidden,
};
