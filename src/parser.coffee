nodePath = require 'path'
fs = require 'fs'
glob = require 'glob'
JadeParser = require 'jade/lib/parser'


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

        parser = new JadeParser string, file, @options

        while true
          try
            break if (type = parser.peek().type) is 'eos'
          catch e
            e.message += file
            throw e

          switch type
            when 'extends', 'include'
              path = parser.expect(type).val.trim()
              path = parser.resolvePath path, type

              if path is nodePath.join(@options.basedir, filename)
                if type is 'extends'
                  relationship = 'extendedBy'
                else if type is 'include'
                  relationship = 'includedBy'

                newFile = {}

                if @cache[file].inheritance?
                  {inheritance} = @cache[file]
                else
                  inheritance = @cache[file].inheritance = @getInheritance relativeFile, files

                newFile = inheritance

                branch[filename][relationship] ?= []
                branch[filename][relationship].push newFile

            else
              parser.advance()

    return branch


  addFile: (filename) ->
    @files[filename] = null unless @files[filename]?


module.exports = Parser
