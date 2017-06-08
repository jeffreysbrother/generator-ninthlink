const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');

describe('slug name', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .withPrompts({features: []})
      .on('end', done);
  });

  it('should generate the same appname in every file', function () {
    var name = path.basename(process.cwd());

    assert.fileContent('bower.json', '"name": "' + name + '"');
    assert.fileContent('app/index.html', '<title>' + name + '</title>');
  });
});
