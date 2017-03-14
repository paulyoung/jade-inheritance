This is fork of [Paul Young's](https://github.com/paulyoung) [jade-inheritance](https://github.com/paulyoung/jade-inheritance) lib migrated to new Pug parser and JavaScript (from CoffeeScript).

---

# Pug-inheritance

[![Build Status](https://travis-ci.org/adammockor/pug-inheritance.svg?branch=master)](https://travis-ci.org/adammockor/pug-inheritance)


## Table of Contents

- [Prerequisites](#prerequisites)
- [Install](#install)
- [Command line usage](#command-line-usage)
- [Usage](#usage)
- [Test](#test)
- [License](#license)


## Prerequisites

```
node.js >= 6.9.0
```

## Install

```sh
npm install -g pug-inheritance
```

## Command line usage
```sh
$ pug-inheritance --help
```

Reduce compilation time for [Pug](https://github.com/pugjs/pug) files by understanding inheritance.

## Usage

```javascript
const inheritance = new PugInheritance(filePath, [baseDir, [options]]);
```

### The problem
When a Pug template is modified, there is no way of knowing how that change has affected the rest of a project. Other files that have extended or included the modified file also need to be compiled.

As a result, common practice is to compile **all** template files to ensure that everything is up to date. This does not bode well for rapid development since files are unnecessarily being compiled and this can take a long time on a large project or if the use of inheritance and mixins is pervasive.

### The solution
Use `pug-inheritance` to determine which files in a project extend and include modified files, and only compile those that are affected.

### An example

```javascript
const PugInheritance = require('pug-inheritance');
const inheritance = new PugInheritance('foo.pug', './templates');
```

### Inheritance tree
```javascript
console.log(inheritance.tree);
```

Output:
```json
{
  "foo.pug": {
    "extendedBy": {
      "bar.pug": {
        "includedBy": {
          "baz.pug": {}
        }
      }
    },
    "extendedBy": {
      "qux.pug": {}
    }
  }
}
```

### Dependant files
```javascript
console.log(inheritance.files);
```

Output:
```json
[
  "foo.pug",
  "bar.pug",
  "baz.pug",
  "qux.pug"
]
```

### Options

  - `options.basedir = 'app'`

    Defines the root, from where pug-inheritance starts to scan for all `*.pug` files in all existing folders within the basedir.

    ```javascript
    var options {
      basedir: 'app'
    }
    ```

  - `options.skip = 'node_modules'`

    If you are using the root folder `options.basedir = '.'` to process your `*.pug` files, you have to skip `node_modules`. Because of dependant PUG-packages which may contain test files, that may cause errors during the compile.
    This option accepts a string or an array.
    ```javascript
    var options {
      // as string
      skip: 'node_modules',
      // or as array
      skip: ['node_modules', 'some_other_folder']
    }
    ```
    If you want to set this global, you are able set this option also into your `package.json`. But watch out, this will be overwritten by setting this option directly to the pug-inheritance object.
    ```JSON
    {
      "skipInheritances": [
        "node_modules"
      ]
    }
    ```

## Test
```sh
$ npm test
```

## License

MIT