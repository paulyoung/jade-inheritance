const Parser = require('./parser');

class PugInheritance {
  constructor(filename, directory, options) {
    let parser = new Parser(filename, directory, options);
    this.tree = parser.tree;
    this.files = parser.files;
    return this;
  }
}

module.exports = PugInheritance;
