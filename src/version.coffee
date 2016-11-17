compareVersion = require('semver');
underscore = require('underscore');

class CheckJadeVersion
  constructor: (pkg, versionComparator) ->
    @dependencies = if pkg.dependencies then pkg.dependencies else {};
    @devDependencies = if pkg.devDependencies then pkg.devDependencies else {};
    @allDependencies = underscore.extend(@dependencies, @devDependencies);
    @regex = /\^|\~|<|<\=|\>|\>\=|\=/
    cleanedVersion = null
    @deprecated = false

    for key of @allDependencies
      switch key
        when 'jade', 'pug', 'gulp-pug', 'jade-pug'
          cleanedVersion = @cleanUpVersion(@allDependencies[key]);
          @deprecated = compareVersion.lt(versionComparator, cleanedVersion);
    return @deprecated

  cleanUpVersion: (version) ->
    result = null
    cleanedVersion = null
    if (result = @regex.exec(version)) != null
      if result.index == @regex.lastIndex
        @regex.lastIndex++;

    if result && typeof result == 'object'
      if version.indexOf(result[0]) != -1
        cleanedVersion = version.replace(result[0], '')
      return cleanedVersion
    else
      return version

module.exports = CheckJadeVersion
