var test = require('tape');
var path = require('path');

var PugInheritance = require('../lib/');

var plugin = function(src) {
  return new PugInheritance(src, '.', {'basedir': '.'});
};

test('Single file', function(t) {
  var expectedResult = [
    path.join('test','fixtures','fixture1.jade')
  ];
  
  var inheritance = plugin('test/fixtures/fixture1.jade');
  t.deepEqual(inheritance.files, expectedResult, 'Single file shoud be outputed');
  
  t.end();
});

test('Includes', function(t) {
  var expectedResult = [
    path.join('test','fixtures','fixture3.jade'),
    path.join('test','fixtures','fixture1.jade'),
    path.join('test','fixtures','fixture2.jade'),
  ];
  
  var inheritance = plugin('test/fixtures/fixture3.jade');
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
  
  var inheritance = plugin('test/fixtures/subfolder/fixture4.jade');
  t.deepEqual(inheritance.files, expectedResult, 'Expected files should match output');
  
  t.end();
});