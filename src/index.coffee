Parser = require './parser'

class JadeInheritance
  constructor: (filename, directory, options) ->
    parser = new Parser filename, directory, options
    @tree = parser.tree
    @files = parser.files
    return this

module.exports = JadeInheritance
