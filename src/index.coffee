Parser = require './parser'
fs = require 'fs'
CheckJadeVersion = require './version'
pkginfo = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

class PugInheritance
  constructor: (filename, directory, options) ->
    checkJadeVersion = new CheckJadeVersion pkginfo, '1.10.0'
    options.deprecated = checkJadeVersion.deprecated
    parser = new Parser filename, directory, options
    @tree = parser.tree
    @files = parser.files
    return this

module.exports = PugInheritance
