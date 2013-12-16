# jade-inheritance
Reduce compilation time for [Jade](https://github.com/visionmedia/jade) files by understanding inheritance.

## The problem
When a Jade template is modified, there is no way of knowing how that change has affected the rest of a project. Other files that have extended or included the modified file also need to be compiled.

As a result, common practice is to compile **all** template files to ensure that everything is up to date. This does not bode well for rapid development since files are unnecessarily being compiled and this can take a long time on a large project or if the use of inheritance and mixins is pervasive.

## The solution
Use `jade-inheritance` to determine which files in a project extend and include modified files, and only compile those that are affected.

## An example
```javascript
var JadeInheritance = require('jade-inheritance');
var inheritance = new JadeInheritance('foo.jade');
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


var JadeInheritance = require('jade-inheritance');
var changedFiles = [];

var onChange = grunt.util._.debounce(function() {
  var options = grunt.config('jade.compile.options');
  var dependantFiles = [];

  changedFiles.forEach(function(filename) {
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

## Possible concerns
Currently, `jade-inheritance` depends on its own version of Jade to parse templates. Since `jade-inheritance` does not offer compilation, this must be done using other tools which may use a different version of Jade.
