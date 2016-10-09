nodePath = require 'path'
fs = require 'fs'
glob = require 'glob'
pkginfo = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

pugLex = require 'pug-lexer'
pugParser = require 'pug-parser'
pugWalk = require 'pug-walk'

resolvePath = (path, file, basedir, extension, purpose) ->

  if path[0] != '/' && !file || path[0] != '\\' && !file
    throw new Error 'the "filename" option is required to use "' + purpose + '" with "relative" paths'

  if path[0] == '/' && !basedir || path[0] != '\\' && !basedir
    throw new Error 'the "basedir" option is required to use "' + purpose + '" with "absolute" paths'

  path = nodePath.join((if path[0] == '/' || path[0] == '\\' then basedir else nodePath.dirname(file)), path)
  if (nodePath.basename(path).indexOf(extension) == -1) then path += extension

  return path

class Parser

  constructor: (filename, directory, options) ->
    @filename = filename
    @directory = directory
    @options = options

    @extension = ''
    if @options.extension
      @extension = if @options.extension.indexOf('.') > -1 then @options.extension else '.' + @options.extension
    else
      @extension = '.pug'

    @skipInheritances = if @options.skip then @options.skip else pkginfo.skipInheritances

    @cache = {}
    @files = {}

    filename = nodePath.relative @options.basedir, filename
    @addFile filename

    files = glob.sync "#{@directory}/**/*#{@extension}"
    @tree = @getInheritance filename, files

    files = @files
    @files = []
    @files.push filename for filename of files

    return this


  getInheritance: (filename, files) ->
    @addFile filename
    branch = {}
    branch[filename] ?= {}

    for file in files
      if typeof @skipInheritances == 'object'
        for skip in @skipInheritances
          if file.indexOf(skip) == -1
            @createInheritanceObject file, files, filename, branch
      else if typeof @skipInheritances == 'string'
        if file.indexOf(@skipInheritances) == -1
          @createInheritanceObject file, files, filename, branch
      else
        console.warn('Skip inheritances is not set. This may throw an error, if basedir is set to "." and pug-inheritance is resolving files also in package folders.')
        @createInheritanceObject file, files, filename, branch

    return branch

  createInheritanceObject: (file, files, filename, branch) ->
    file = nodePath.normalize file
    relativeFile = nodePath.relative @options.basedir, file
    file = nodePath.join @options.basedir, relativeFile
    @cache[file] ?= {}

    if @cache[file].string?
      {string} = @cache[file]
    else
      string = @cache[file].string = fs.readFileSync file, 'utf8'

    try
      pugWalk pugParser(pugLex string, {filename: file}), (node) =>

        type = node.type
        switch type
          when 'Extends', (if @options.deprecated then 'Include' else 'RawInclude')
            path = resolvePath node.file.path, file, @options.basedir, @extension, type

            if path is nodePath.join(@options.basedir, filename)
              if type is 'Extends'
                relationship = 'extendedBy'
              else if type is 'RawInclude' || type is 'Include'
                relationship = 'includedBy'

              newFile = {}

              if @cache[file].inheritance?
                {inheritance} = @cache[file]
              else
                inheritance = @cache[file].inheritance = @getInheritance relativeFile, files

              newFile = inheritance

              branch[filename][relationship] ?= []
              branch[filename][relationship].push newFile
        return branch
    catch e
      throw e



  addFile: (filename) ->
    @files[filename] = null unless @files[filename]?


module.exports = Parser
