# fs-man
A file system utility that can be used with Node.js fs module.

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jooy2/fs-man/blob/master/LICENSE)
![Programming Language Usage](https://img.shields.io/github/languages/top/jooy2/fs-man)
[![npm latest package](https://img.shields.io/npm/v/fs-man/latest.svg)](https://www.npmjs.com/package/fs-man)
![minified size](https://img.shields.io/bundlephobia/min/fs-man)
![github repo size](https://img.shields.io/github/repo-size/jooy2/fs-man)
[![npm downloads](https://img.shields.io/npm/dm/fs-man.svg)](https://www.npmjs.com/package/fs-man)
[![Followers](https://img.shields.io/github/followers/jooy2?style=social)](https://github.com/jooy2)

## Installation

```shell
$ npm i --save fs-man
```

## Usage

### Using multiple utilities simultaneously with one object

```javascript
const fsman = require('fs-man');

function main () {
console.log(fsman.isHidden('.hiddenFile')); // true
}
```

### Using multiple utilities in a single require

```javascript
const { isHidden } = require('fs-man');

function main () {
    console.log(fsman.isHidden('.hiddenFile')); // true
}
```

## Methods

### `isHidden <Promise>`

Checks whether a file or folder in the specified path is a hidden file.
Determines system hidden files for Windows and the presence or absence of a `.`(dot) for Linux and macOS or other operating systems.
- `path <String>`: File or directory path
- `isWindows <Boolean>`: Whether the target operating system to be checked is Windows

```javascript
console.log(await fsman.isHidden('text.txt')); // false
console.log(await fsman.isHidden('.hiddenFile')); // true
console.log(await fsman.isHidden('.hiddenFile', true)); // false (Files with no hidden attribute applied in Windows)
```

### `humanizeSize <String>`
Returns the given byte argument as a human-friendly string.
- `bytes <Number>`: Converts it to a human-friendly string via the bytes provided here.
- `decimals <Number> (Default: 2)`: Specifies the number of decimal places to represent.

```javascript
console.log(await fsman.humanizeSize(1000000)); // '976.56 KB'
console.log(await fsman.humanizeSize(100000000, 3)); // '95.367 MB'
```

## License
Copyright © 2022 Jooy2 Released under the MIT license.
