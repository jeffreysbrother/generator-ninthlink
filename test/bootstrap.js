const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');

describe('Bootstrap feature', () => {
  describe('on', () => {
    before(done => {
      helpers.run(path.join(__dirname, '../app'))
        .withPrompts({features: [
          'includeBootstrap'
        ]})
        .on('end', done);
    });

    it('shouldn\'t add jQuery explicitly as a dependency', () => {
      assert.noFileContent('bower.json', '"jquery"');
    });

    it('should add the comment block', () => {
      assert.fileContent('app/index.html', 'build:js scripts/plugins.js')
    });
  });

  describe('off', () => {
    before(done => {
      helpers.run(path.join(__dirname, '../app'))
        .withPrompts({features: []})
        .on('end', done);
    });

    it('should add jQuery explicitly as a dependency', () => {
      assert.fileContent('bower.json', '"jquery"');
    });

    it('shouldn\'t add the comment block', () => {
      assert.noFileContent('app/index.html', 'build:js scripts/plugins.js')
    });
  });

  describe('with Sass', () => {
    before(done => {
      helpers.run(path.join(__dirname, '../app'))
        .withPrompts({features: [
          'includeSass',
          'includeBootstrap'
        ]})
        .on('end', done);
    });

    it('should use Bootstrap Sass', () => {
      assert.fileContent('bower.json', '"bootstrap-sass"');
    });

    it('should output the correct <script> paths', () => {
      assert.fileContent('app/index.html', /src=\"(.*?)\/bootstrap-sass\/assets\/javascripts\/bootstrap\//);
    });

    it('should contain the font icon path variable', () => {
      assert.fileContent('app/styles/main.scss', '$icon-font-path');
    });

    it('should correctly override bootstrap\'s bower.json', function() {
      assert.fileContent('bower.json', '"overrides"');

      assert.fileContent('bower.json', 'assets/stylesheets/_bootstrap.scss');

      assert.fileContent('bower.json', 'assets/fonts/bootstrap/*');

      assert.fileContent('bower.json', 'assets/javascripts/bootstrap.js');
    });
  });

  describe('without Sass', () => {
    before(done => {
      helpers.run(path.join(__dirname, '../app'))
        .withPrompts({features: [
          'includeBootstrap'
        ]})
        .on('end', done);
    });

    it('should use Bootstrap', () => {
      assert.fileContent('bower.json', '"bootstrap"');
    });

    it('should output the correct <script> paths', () => {
      assert.fileContent('app/index.html', /src=\"(.*?)\/bootstrap\/js\//);
    });

    it('should correctly override bootstrap\'s bower.json', function() {
      assert.fileContent('bower.json', '"overrides"');

      assert.fileContent('bower.json', 'less/bootstrap.less');

      assert.fileContent('bower.json', 'dist/css/bootstrap.css');

      assert.fileContent('bower.json', 'dist/js/bootstrap.js');

      assert.fileContent('bower.json', 'dist/fonts/*');
    });
  });
});
