var test = require('tape');
var path = require('path');

var PugInheritance = require('../lib/'),
    baseDir = '.';

var plugin = function(src, directory, ext) {
  var options = {
    basedir: baseDir,
    extension: ext ? ext : 'jade'
  };
  return new PugInheritance(src, directory, options);
};

test('Single file', function(t) {
  var expectedResult = [
    path.join('test','fixtures','fixture1.jade')
  ];

  var inheritance = plugin('test/fixtures/fixture1.jade', baseDir);
  t.deepEqual(inheritance.files, expectedResult, 'Single file shoud be outputed');

  t.end();
});

test('Includes', function(t) {
  var expectedResult = [
    path.join('test','fixtures','fixture3.jade'),
    path.join('test','fixtures','fixture1.jade'),
    path.join('test','fixtures','fixture2.jade'),
  ];

  var inheritance = plugin('test/fixtures/fixture3.jade', baseDir);
  t.deepEqual(inheritance.files, expectedResult, 'Expected files should match output');

  t.end();
});

test('Include with extends', function(t) {
  var expectedResult = [
    path.join('test','fixtures', 'subfolder', 'fixture4.jade'),
    path.join('test','fixtures','fixture2.jade'),
    path.join('test','fixtures','fixture3.jade'),
    path.join('test','fixtures','fixture1.jade'),
  ];

  var inheritance = plugin('test/fixtures/subfolder/fixture4.jade', baseDir);
  t.deepEqual(inheritance.files, expectedResult, 'Expected files should match output');

  t.end();
});

test('Single file with magic extension', function(t) {
  var expectedResult = [
    path.join('test','fixtures','fixture1.magic'),
  ];

  var inheritance = plugin('test/fixtures/fixture1.magic', baseDir, '.magic');
  t.deepEqual(inheritance.files, expectedResult, 'Single file with *.magic extension shoud be outputed');

  t.end();
});

test('Includes with magic extension', function(t) {
  var expectedResult = [
    path.join('test','fixtures','fixture3.magic'),
    path.join('test','fixtures','fixture1.magic'),
    path.join('test','fixtures','fixture2.magic'),
  ];

  var inheritance = plugin('test/fixtures/fixture3.magic', baseDir, '.magic');
  t.deepEqual(inheritance.files, expectedResult, 'Expected files with *.magic extension should match output');

  t.end();
});
