Parser = require './parser'

class PugInheritance
  constructor: (filename, directory, options) ->
    parser = new Parser filename, directory, options
    @tree = parser.tree
    @files = parser.files
    return this

module.exports = PugInheritance
