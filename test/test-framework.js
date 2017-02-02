'use strict';
var path = require('path');
var helpers = require('yeoman-test');
var assert = require('yeoman-assert');

describe('test framework', () => {
  describe('mocha', () => {
    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .withOptions({'test-framework': 'mocha'})
        .withPrompts({features: []})
        .on('end', done);
    });

    it('generates the expected fixture', () => {
      assert.fileContent('test/index.html', 'mocha');
    });
  });

  describe('jasmine', () => {
    before(done => {
      helpers.run(path.join(__dirname, '../app'))
        .withOptions({'test-framework': 'jasmine'})
        .withPrompts({features: []})
        .on('end', done);
    });

    it('generates the expected fixture', () => {
      assert.fileContent('test/index.html', 'jasmine');
    });
  });
});
