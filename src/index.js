const fs = require("fs");

const isHidden = (path, isWindows) => {
    return new Promise(resolve => {
        if (isWindows) {
            fs.open(path, 'w', err => {
                resolve(err?.code === 'EPERM')
            })
        } else {
            resolve(/(^|\/)\.[^/.]/.test(path));
        }
    })
}

module.exports = {
    isHidden
}
