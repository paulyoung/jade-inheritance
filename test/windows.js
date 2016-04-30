var test = require('tape');

var PugInheritance = require('../lib/');

var plugin = function(src) {
  return new PugInheritance(src, '.', {'basedir': '.'});
};

test('Single file', function(t) {
  var expectedResult = [
    'test\\fixtures\\fixture1.jade'
  ];

  var inheritance = plugin('test/fixtures/fixture1.jade');
  t.deepEqual(inheritance.files, expectedResult, 'Single file shoud be outputed');

  t.end();
});

test('Includes', function(t) {
  var expectedResult = [
    'test\\fixtures\\fixture3.jade',
    'test\\fixtures\\fixture1.jade',
    'test\\fixtures\\fixture2.jade'
  ];

  var inheritance = plugin('test/fixtures/fixture3.jade');
  t.deepEqual(inheritance.files, expectedResult, 'Expected files should match output');

  t.end();
});

test('Include with extends', function(t) {
  var expectedResult = [
    'test\\fixtures\\subfolder\\fixture4.jade',
    'test\\fixtures\\fixture2.jade',
    'test\\fixtures\\fixture3.jade',
    'test\\fixtures\\fixture1.jade'
  ];

  var inheritance = plugin('test/fixtures/subfolder/fixture4.jade');
  t.deepEqual(inheritance.files, expectedResult, 'Expected files should match output');

  t.end();
});

test('Error in parsing', function(t) {
  t.throws(plugin('test/fixtures/fixture5.jade'), null, 'Should throw an error');
  t.end();
});
