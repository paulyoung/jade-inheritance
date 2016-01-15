nodePath = require 'path'
fs = require 'fs'
glob = require 'glob'

pugLex = require 'pug-lexer'
pugParser = require 'pug-parser'
pugWalk = require 'pug-walk'

resolvePath = (path, file, basedir, purpose) ->
  
  if path[0] != '/' && !file
    throw new Error 'the "filename" option is required to use "' + purpose + '" with "relative" paths'

  if path[0] == '/' && !basedir
    throw new Error 'the "basedir" option is required to use "' + purpose + '" with "absolute" paths'
  
  path = nodePath.join((if path[0] == '/' then basedir else nodePath.dirname(file)), path)
  if (nodePath.basename(path).indexOf('.') == -1) then path += '.jade'
  
  return path
  
class Parser

  constructor: (filename, directory, options) ->
    @filename = filename
    @directory = directory
    @options = options

    @cache = {}
    @files = {}

    filename = nodePath.relative @options.basedir, filename
    @addFile filename

    files = glob.sync "#{@directory}/**/*.jade"
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
      do (file) =>
        file = nodePath.normalize file
        relativeFile = nodePath.relative @options.basedir, file
        file = nodePath.join @options.basedir, relativeFile
        @cache[file] ?= {}

        if @cache[file].string?
          {string} = @cache[file]
        else
          string = @cache[file].string = fs.readFileSync file, 'utf8'
        
        try 
          pugWalk pugParser(pugLex string, file), (node) =>
            
            type = node.type
            switch type
              when 'Extends', 'RawInclude'
                path = resolvePath node.file.path, file, @options.basedir, type
                
                if path is nodePath.join(@options.basedir, filename)
                  if type is 'Extends'
                    relationship = 'extendedBy'
                  else if type is 'RawInclude'
                    relationship = 'includedBy'

                  newFile = {}

                  if @cache[file].inheritance?
                    {inheritance} = @cache[file]
                  else
                    inheritance = @cache[file].inheritance = @getInheritance relativeFile, files

                  newFile = inheritance

                  branch[filename][relationship] ?= []
                  branch[filename][relationship].push newFile
        
        catch e
          throw e

    return branch


  addFile: (filename) ->
    @files[filename] = null unless @files[filename]?


module.exports = Parser
