# jade-inheritance
This tool can be used to reduce compilation time for Jade files.

For example, without `jade-inheritance`, a `watch` task on a directory would recompile all template files when any change was made within that directory. With `jade-inheritance`, only the affected files can be recompiled.


## Example
```javascript
var JadeInheritance = require('jade-inheritance');
var inheritance = JadeInheritance('foo.jade');
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


var JadeInheritance = require('jade-inheritance');
var changedFiles = [];

var onChange = grunt.util._.debounce(function() {
  var options = grunt.config('jade.compile.options');
  var dependantFiles = [];

  files.forEach(function(filename) {
    var directory = options.basedir;
    var inheritance = new JadeInheritance(filename, directory, options);
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

## Installation
```sh
$ npm install -g jade-inheritance
```

## Command line usage
```sh
$ jade-inheritance --help
```

## Development
### Build
```sh
$ npm run-script build
```
