var test = require('tape');
var path = require('path');

var PugInheritance = require('../lib/'),
    baseDir = '.';

var Version = require('../lib/version.js');

var plugin = function(src, directory, ext, skip) {
  var options = {
    basedir: baseDir,
    extension: ext ? ext : 'jade',
    skip: skip
  };
  return new PugInheritance(src, directory, options);
};

var testVersion = function(pkgInfo, version) {
  return new Version(pkgInfo, version);
};

test('Single file and skip-inheritances option is default', function(t) {
  var expectedResult = [
    path.join('test','fixtures','fixture1.jade')
  ];

  var inheritance = plugin('test/fixtures/fixture1.jade', baseDir);
  t.deepEqual(inheritance.files, expectedResult, 'Single file shoud be outputed');
  t.deepEqual(typeof inheritance.tree, 'object', 'Pug Inheritance Tree should be an object');
  t.end();
});

test('Includes and skip-inheritances option is default', function(t) {
  var expectedResult = [
    path.join('test','fixtures','fixture3.jade'),
    path.join('test','fixtures','fixture1.jade'),
    path.join('test','fixtures','fixture2.jade'),
  ];

  var inheritance = plugin('test/fixtures/fixture3.jade', baseDir);
  t.deepEqual(inheritance.files, expectedResult, 'Expected files should match output');
  t.deepEqual(typeof inheritance.tree, 'object', 'Pug Inheritance Tree should be an object');
  t.end();
});

test('Include with extends and skip-inheritances option is default', function(t) {
  var expectedResult = [
    path.join('test','fixtures', 'subfolder', 'fixture4.jade'),
    path.join('test','fixtures','fixture2.jade'),
    path.join('test','fixtures','fixture3.jade'),
    path.join('test','fixtures','fixture1.jade'),
  ];

  var inheritance = plugin('test/fixtures/subfolder/fixture4.jade', baseDir);
  t.deepEqual(inheritance.files, expectedResult, 'Expected files should match output');
  t.deepEqual(typeof inheritance.tree, 'object', 'Pug Inheritance Tree should be an object');
  t.end();
});

test('Single file with pug extension and skip-inheritances option is set as string', function(t) {
  var expectedResult = [
    path.join('test','fixtures','fixture1.pug'),
  ];

  var inheritance = plugin('test/fixtures/fixture1.pug', baseDir, '.pug', 'node_modules');
  t.deepEqual(inheritance.files, expectedResult, 'Single file with *.pug extension shoud be outputed');
  t.deepEqual(typeof inheritance.tree, 'object', 'Pug Inheritance Tree should be an object');
  t.end();
});

test('Includes with pug extension and skip-inheritances option is set as object', function(t) {
  var expectedResult = [
    path.join('test','fixtures','fixture3.pug'),
    path.join('test','fixtures','fixture1.pug'),
    path.join('test','fixtures','fixture2.pug'),
  ];

  var inheritance = plugin('test/fixtures/fixture3.pug', baseDir, '.pug', ['node_modules']);
  t.deepEqual(inheritance.files, expectedResult, 'Expected files with *.pug extension should match output');
  t.deepEqual(typeof inheritance.tree, 'object', 'Pug Inheritance Tree should be an object');
  t.end();
});

test('Check Jade / Pug version, Version is higher then 1.10.0', function(t) {
  var pkgHigher = {
    "dependencies" : {
      "jade" : "^2.0.0"
    }
  };
  var pkgLower = {
    "dependencies" : {
      "jade" : "^1.9.0"
    }
  };
  var higher = testVersion(pkgHigher, '1.10.0');
  var lower = testVersion(pkgLower, '1.10.0');

  t.deepEqual(higher.deprecated, true, 'Result should be true, because version is higher the 1.10.0');
  t.deepEqual(lower.deprecated, false, 'Result should be false, because version is higher the 1.10.0');
  t.end();
});
