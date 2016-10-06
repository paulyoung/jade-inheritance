This is fork of [Paul Young's](https://github.com/paulyoung) [jade-inheritance](https://github.com/paulyoung/jade-inheritance) lib migrated to new Pug parser (former Jade).

---

# pug-inheritance

[![Build Status](https://travis-ci.org/adammockor/pug-inheritance.svg?branch=master)](https://travis-ci.org/adammockor/pug-inheritance)

Reduce compilation time for [Pug (Jade)](https://github.com/pugjs/jade) files by understanding inheritance.

## The problem
When a Pug (former Jade) template is modified, there is no way of knowing how that change has affected the rest of a project. Other files that have extended or included the modified file also need to be compiled.

As a result, common practice is to compile **all** template files to ensure that everything is up to date. This does not bode well for rapid development since files are unnecessarily being compiled and this can take a long time on a large project or if the use of inheritance and mixins is pervasive.

## The solution
Use `pug-inheritance` to determine which files in a project extend and include modified files, and only compile those that are affected.

## An example
```javascript
var PugInheritance = require('pug-inheritance');
var inheritance = new PugInheritance('foo.jade');
```

### Inheritance tree
```javascript
console.log(inheritance.tree);
```

Output:
```json
{
  "foo.jade": {
    "extendedBy": {
      "bar.jade": {
        "includedBy": {
          "baz.jade": {}
        }
      }
    },
    "extendedBy": {
      "qux.jade": {}
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
  "foo.jade",
  "bar.jade",
  "baz.jade",
  "qux.jade"
]
```

### Integration with [grunt-contrib-jade](https://github.com/gruntjs/grunt-contrib-jade)
```javascript
// Gruntfile.js
grunt.initConfig({
  watch: {
    jade: {
      files: [
        'app/**/*.jade'
      ],
      tasks: [
        'jade:compile'
      ],
      nospawn: true
    }
  },
  jade: {
    compile: {
      options: {
        basedir: 'app',
        pretty: true
      },
      files: [{
        expand: true,
        src: 'app/**/*.jade',
        dest: 'assets/',
        ext: '.html'
      }]
    }
  }
});


var PugInheritance = require('pug-inheritance');
var changedFiles = [];

var onChange = grunt.util._.debounce(function() {
  var options = grunt.config('jade.compile.options');
  var dependantFiles = [];

  changedFiles.forEach(function(filename) {
    var directory = options.basedir;
    var inheritance = new PugInheritance(filename, directory, options);
    dependantFiles = dependantFiles.concat(inheritance.files);
  });

  var config = grunt.config('jade.compile.files')[0];
  config.src = dependantFiles;
  grunt.config('jade.compile.files', [config]);

  changedFiles = [];
}, 200)

grunt.event.on('watch', function(action, filepath) {
  changedFiles.push(filepath);
  onChange();
});
```

## Options


  - `options.basedir = 'app'`

    Defines the root, from where pug-inheritance starts to scan for all `*.jade` files in all existing folders within the basedir.

    ```javascript
    var options {
      basedir: 'app'
    }
    ```

  - `options.extension = '.pug',`

    Defines the used file extension. This option was integrated because of the conversion of Jade to Pug.
    If you allready use `*.pug` as file extension you can leave this option aside, but if you still use `*.jade` you need to set this option.

    ```javascript
    var options {
      extension: '.pug' // Default is '.pug'
    }
    ```

  - `options.skip = 'node_modules'`

    If you are using the root folder `options.basedir = '.'` to process your `*.jade` files, you have to skip `node_modules`. Because of dependant PUG-packages which may contain test files, that may cause errors during the compile.
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

## Installation
```sh
$ npm install -g pug-inheritance
```

## Command line usage
```sh
$ pug-inheritance --help
```

## Development
### Build
```sh
$ npm run-script build
```

### Test
```sh
$ npm test
```

## Possible concerns
Currently, `pug-inheritance` depends on its own version of Pug to parse templates. Since `pug-inheritance` does not offer compilation, this must be done using other tools which may use a different version of Pug (Jade).
