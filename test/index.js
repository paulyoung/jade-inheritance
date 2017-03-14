var test = require('tape');
var path = require('path');

var PugInheritance = require('../src/'),
    baseDir = './test';

var plugin = function(src, directory, ext, skip) {
  var options = {
    basedir: baseDir,
    skip: skip
  };
  return new PugInheritance(src, directory, options);
};

test('Single file, skip-inheritances option is default', function(t) {
  var expectedResult = [
    path.join('fixtures','fixture1.pug')
  ];

  var inheritance = plugin('test/fixtures/fixture1.pug', baseDir);
  t.deepEqual(inheritance.files, expectedResult, 'Single file shoud be outputed');
  t.deepEqual(typeof inheritance.tree, 'object', 'Pug Inheritance Tree should be an object');
  t.end();
});

test('Includes, skip-inheritances option is default', function(t) {
  var expectedResult = [
    path.join('fixtures','fixture3.pug'),
    path.join('fixtures','fixture1.pug'),
    path.join('fixtures','fixture2.pug'),
  ];

  var inheritance = plugin('test/fixtures/fixture3.pug', baseDir);
  t.deepEqual(inheritance.files, expectedResult, 'Expected files should match output');
  t.deepEqual(typeof inheritance.tree, 'object', 'Pug Inheritance Tree should be an object');
  t.end();
});

test('Include with extends, skip-inheritances option is default', function(t) {
  var expectedResult = [
    path.join('fixtures', 'subfolder', 'fixture4.pug'),
    path.join('fixtures','fixture2.pug'),
    path.join('fixtures','fixture3.pug'),
    path.join('fixtures','fixture1.pug'),
  ];

  var inheritance = plugin('test/fixtures/subfolder/fixture4.pug', baseDir);
  t.deepEqual(inheritance.files, expectedResult, 'Expected files should match output');
  t.deepEqual(typeof inheritance.tree, 'object', 'Pug Inheritance Tree should be an object');
  t.end();
});
