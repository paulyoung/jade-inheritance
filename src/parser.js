const nodePath = require('path');
const fs = require('fs');
const glob = require('glob');

const pugLex = require('pug-lexer');
const pugParser = require('pug-parser');
const pugWalk = require('pug-walk');
const pugDependency = require('pug-dependency');

let pkginfo = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

let resolvePath = function(path, file, basedir, extension, purpose) {

  if (((path[0] !== '/') && !file) || ((path[0] !== '\\') && !file)) {
    throw new Error(`the "filename" option is required to use "${purpose}" with "relative" paths`);
  }

  if (((path[0] === '/') && !basedir) || ((path[0] !== '\\') && !basedir)) {
    throw new Error(`the "basedir" option is required to use "${purpose}" with "absolute" paths`);
  }

  path = nodePath.join(((path[0] === '/') || (path[0] === '\\') ? basedir : nodePath.dirname(file)), path);
  if (nodePath.basename(path).indexOf(extension) === -1) { path += extension; }

  return path;
};

class Parser {

  constructor(filename, directory, options) {
    this.filename = filename;
    this.directory = directory;
    this.options = options;

    this.extension = '.pug';

    this.skipInheritances = this.options.skip ? this.options.skip : pkginfo.skipInheritances;

    this.cache = {};
    this.files = {};
    this.filename = nodePath.relative(this.options.basedir, this.filename);
    this.addFile(this.filename);

    let files = glob.sync(`${this.directory}/**/*${this.extension}`);
    this.tree = this.getInheritance(this.filename, files);


    ({ files } = this);
    this.files = [];
    for (filename in files) { this.files.push(filename); }
    console.log(nodePath.join(this.options.basedir, this.filename));
    this.dependencies = this.getDependencies(nodePath.join(this.options.basedir, this.filename));

    console.log(JSON.stringify(this, null, 2));
    return this;
  }


  getInheritance(filename, files) {
    this.addFile(filename);
    let branch = {};
    if (branch[filename] == null) { branch[filename] = {}; }

    for (let file of Array.from(files)) {
      if (typeof this.skipInheritances === 'object') {
        for (let skip of Array.from(this.skipInheritances)) {
          if (file.indexOf(skip) === -1) {
            this.createInheritanceObject(file, files, filename, branch);
          }
        }
      } else if (typeof this.skipInheritances === 'string') {
        if (file.indexOf(this.skipInheritances) === -1) {
          this.createInheritanceObject(file, files, filename, branch);
        }
      } else {
        console.warn('Skip inheritances is not set. This may throw an error, if basedir is set to "." and pug-inheritance is resolving files also in package folders.');
        this.createInheritanceObject(file, files, filename, branch);
      }
    }

    return branch;
  }

  createInheritanceObject(file, files, filename, branch) {
    let string;
    file = nodePath.normalize(file);
    let relativeFile = nodePath.relative(this.options.basedir, file);
    file = nodePath.join(this.options.basedir, relativeFile);
    if (this.cache[file] == null) { this.cache[file] = {}; }

    if (this.cache[file].string != null) {
      ({string} = this.cache[file]);
    } else {
      string = (this.cache[file].string = fs.readFileSync(file, 'utf8'));
    }

    try {
      return pugWalk(pugParser(pugLex(string, {filename: file})), node => {

        let { type } = node;
        switch (type) {
          case 'Extends':
          case 'RawInclude':
          case 'Include':
            let path = resolvePath(node.file.path, file, this.options.basedir, this.extension, type);

            if (path === nodePath.join(this.options.basedir, filename)) {
              let inheritance, relationship;
              if (type === 'Extends') {
                relationship = 'extendedBy';
              } else if ((type === 'RawInclude') || (type === 'Include')) {
                relationship = 'includedBy';
              }

              let newFile = {};

              if (this.cache[file].inheritance != null) {
                ({inheritance} = this.cache[file]);
              } else {
                inheritance = (this.cache[file].inheritance = this.getInheritance(relativeFile, files));
              }

              newFile = inheritance;

              if (branch[filename][relationship] == null) { branch[filename][relationship] = []; }
              branch[filename][relationship].push(newFile);
            }
            break;
        }
        return branch;
      }
      );
    } catch (e) {
      throw e;
    }
  }

  addFile(filename) {
    if (this.files[filename] == null) { return this.files[filename] = null; }
  }

  getDependencies(filePath) {
    const getDependencies = pugDependency(`${this.directory}/**/*${this.extension}`);
    const dependencies = [];

    getDependencies.find_dependencies(filePath).forEach((dependency) => {
      const pathToDependencie = nodePath.relative(this.options.basedir, dependency);
      if ( dependencies.indexOf(pathToDependencie) === -1 ) {
        dependencies.push(pathToDependencie);
      }
    });

    return dependencies;
  };
}

module.exports = Parser;
