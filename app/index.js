'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');
var mkdirp = require('mkdirp');
var _s = require('underscore.string');

module.exports = generators.Base.extend({
  constructor: function () {
    var testLocal;

    generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });

    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });

    this.option('babel', {
      desc: 'Use Babel',
      type: Boolean,
      defaults: true
    });

    if (this.options['test-framework'] === 'mocha') {
      testLocal = require.resolve('generator-mocha/generators/app/index.js');
    } else if (this.options['test-framework'] === 'jasmine') {
      testLocal = require.resolve('generator-jasmine/generators/app/index.js');
    }

    this.composeWith(this.options['test-framework'] + ':app', {
      options: {
        'skip-install': this.options['skip-install']
      }
    }, {
      local: testLocal
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    if (!this.options['skip-welcome-message']) {

      // this will override the default greeting ASCII art
      // this.log(yosay.defaultGreeting =
      // '\n                      '+chalk.yellow('9') +
      // '\n                  '+chalk.yellow('9')+'       '+chalk.yellow('9') +
      // '\n              '+chalk.yellow('9')+'       L       '+chalk.yellow('9') +
      // '\n          '+chalk.yellow('9')+'       L       L       '+chalk.yellow('9') +
      // '\n      '+chalk.yellow('9')+'       L       L       L       '+chalk.yellow('9') +
      // '\n      '+chalk.yellow('9   9')+'       L       L       '+chalk.yellow('9')+chalk.red('///9') +
      // '\n      '+chalk.yellow('9   l   9')+'       L       '+chalk.yellow('9')+chalk.red('///////9') +
      // '\n      '+chalk.yellow('9   l   l   9')+'       '+chalk.yellow('9')+chalk.red('.//////////9') +
      // '\n      '+chalk.yellow('9   l   l   l   9')+'          '+chalk.red('.9///9') +
      // '\n      '+chalk.yellow('9   l   l   l   9')+chalk.red('.')+'             '+chalk.red('.9') +
      // '\n      '+chalk.yellow('9   l   l   l   9')+chalk.red('///9.') +
      // '\n      '+chalk.yellow('9   l   l   l   9')+chalk.red('///////9.') +
      // '\n      '+chalk.yellow('9   l   l   l   9')+chalk.red('///////////9.') +
      // '\n      '+chalk.yellow('9   l   l   l   9')+chalk.red('///////////////')+chalk.yellow('9') +
      // '\n          '+chalk.yellow('9   l   l   9')+chalk.red('///////////')+chalk.yellow('9   9') +
      // '\n              '+chalk.yellow('9   l   9')+chalk.red('///////')+chalk.yellow('9   l   9') +
      // '\n                  '+chalk.yellow('9   9')+chalk.red('///')+chalk.yellow('9   l   l   9') +
      // '\n                      '+chalk.yellow('9   l   l   l   9') +
      // '\n                      '+chalk.yellow('9   l   l   l   9') +
      // '\n                      '+chalk.yellow('9   l   l   l   9') +
      // '\n                      '+chalk.yellow('9   l   l   l   9') +
      // '\n                      '+chalk.yellow('9   l   l   l   9') +
      // '\n                      '+chalk.yellow('9   l   l   9') +
      // '\n                      '+chalk.yellow('9   l   9') +
      // '\n                      '+chalk.yellow('9   9') +
      // '\n                      '+chalk.yellow('9') +
      // '\n   ' +
      // '\n   ');

      // commented out becasue this dumps the message AND the default ASCII ART
      this.log(yosay('Yo Ninthlink! Out of the box I include HTML5 Boilerplate, jQuery, UnCSS, and many more useful tools.'));
    }

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Sass',
        value: 'includeSass',
        checked: true
      }, {
        name: 'Bootstrap',
        value: 'includeBootstrap',
        checked: true
      }, {
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }, {
        name: 'uncss',
        value: 'includeUncss',
        checked: true
      }, {
        name: 'replace Google Analytics with Google Tag Manager?',
        value: 'includeTagManager',
        checked: false
      }]
    }, {
      type: 'confirm',
      name: 'includeJQuery',
      message: 'Would you like to include jQuery?',
      default: true,
      when: function (answers) {
        return answers.features.indexOf('includeBootstrap') === -1;
      }
    }];

    return this.prompt(prompts).then(function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      };

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeSass = hasFeature('includeSass');
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');
      this.includeTagManager = hasFeature('includeTagManager');
      this.includeUncss = hasFeature('includeUncss');
      this.includeJQuery = answers.includeJQuery;

    }.bind(this));
  },

  writing: {
    gulpfile: function () {
      this.fs.copyTpl(
        this.templatePath('gulpfile.js'),
        this.destinationPath('gulpfile.js'),
        {
          date: (new Date).toISOString().split('T')[0],
          name: this.pkg.name,
          version: this.pkg.version,
          includeSass: this.includeSass,
          includeBootstrap: this.includeBootstrap,
          includeUncss: this.includeUncss,
          includeBabel: this.options['babel'],
          testFramework: this.options['test-framework']
        }
      );
    },

    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          includeSass: this.includeSass,
          includeUncss: this.includeUncss,
          includeBabel: this.options['babel']
        }
      );
    },

    babel: function () {
      this.fs.copy(
        this.templatePath('babelrc'),
        this.destinationPath('.babelrc')
      );
    },

    htaccess: function () {
      this.fs.copy(
        this.templatePath('htaccess'),
        this.destinationPath('app/.htaccess')
      );
    },

    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore'));

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes'));
    },

    bower: function () {
      var bowerJson = {
        name: _s.slugify(this.appname),
        private: true,
        dependencies: {}
      };

      if (this.includeBootstrap) {
        if (this.includeSass) {
          bowerJson.dependencies['bootstrap-sass'] = '~3.3.5';
          bowerJson.overrides = {
            'bootstrap-sass': {
              'main': [
                'assets/stylesheets/_bootstrap.scss',
                'assets/fonts/bootstrap/*',
                'assets/javascripts/bootstrap.js'
              ]
            }
          };
        } else {
          bowerJson.dependencies['bootstrap'] = '~3.3.5';
          bowerJson.overrides = {
            'bootstrap': {
              'main': [
                'less/bootstrap.less',
                'dist/css/bootstrap.css',
                'dist/js/bootstrap.js',
                'dist/fonts/*'
              ]
            }
          };
        }
      } else if (this.includeJQuery) {
        bowerJson.dependencies['jquery'] = '~2.1.1';
      }

      if (this.includeModernizr) {
        bowerJson.dependencies['modernizr'] = '~2.8.1';
      }

      this.fs.writeJSON('bower.json', bowerJson);
      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    editorConfig: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
    },

    h5bp: function () {
      this.fs.copy(
        this.templatePath('favicon.ico'),
        this.destinationPath('app/favicon.ico')
      );

      this.fs.copy(
        this.templatePath('apple-touch-icon.png'),
        this.destinationPath('app/apple-touch-icon.png')
      );

      this.fs.copy(
        this.templatePath('robots.txt'),
        this.destinationPath('app/robots.txt'));
    },

    styles: function () {
      var css = 'main';

      if (this.includeSass) {
        css += '.scss';
        var header_partial = '_header.scss';
        var footer_partial = '_footer.scss';
        var variables_partial = '_variables.scss';
        var components_partial = '_components.scss';
        var utilities_partial = '_utilities.scss';

        this.fs.copy(
          this.templatePath(header_partial),
          this.destinationPath('app/styles/' + header_partial));
        this.fs.copy(
          this.templatePath(footer_partial),
          this.destinationPath('app/styles/' + footer_partial));
        this.fs.copy(
          this.templatePath(variables_partial),
          this.destinationPath('app/styles/' + variables_partial));
        this.fs.copy(
          this.templatePath(components_partial),
          this.destinationPath('app/styles/' + components_partial));
        this.fs.copy(
          this.templatePath(utilities_partial),
          this.destinationPath('app/styles/' + utilities_partial));

      } else {
        css += '.css';
      }

      this.fs.copyTpl(
        this.templatePath(css),
        this.destinationPath('app/styles/' + css),
        {
          includeBootstrap: this.includeBootstrap
        }
      );

    },


    scripts: function () {
      this.fs.copy(
        this.templatePath('main.js'),
        this.destinationPath('app/scripts/main.js')
      );
    },

    html: function () {
      var bsPath;

      // path prefix for Bootstrap JS files
      if (this.includeBootstrap) {
        bsPath = '/bower_components/';

        if (this.includeSass) {
          bsPath += 'bootstrap-sass/assets/javascripts/bootstrap/';
        } else {
          bsPath += 'bootstrap/js/';
        }
      }

      this.fs.copyTpl(
        this.templatePath('index.html'),
        this.destinationPath('app/index.html'),
        {
          appname: this.appname,
          includeSass: this.includeSass,
          includeBootstrap: this.includeBootstrap,
          includeModernizr: this.includeModernizr,
          includeTagManager: this.includeTagManager,
          includeJQuery: this.includeJQuery,
          bsPath: bsPath,
          bsPlugins: [
            'affix',
            'alert',
            'dropdown',
            'tooltip',
            'modal',
            'transition',
            'button',
            'popover',
            'carousel',
            'scrollspy',
            'collapse',
            'tab'
          ]
        }
      );
    },

    misc: function () {
      mkdirp('app/images');
      mkdirp('app/fonts');

      // initialize Git repo prior to installing dependencies,
      // so it still works if the user skips dependency installation
      this.spawnCommandSync('git', ['init']);

    }
  },

  install: function () {
    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  },

  end: function () {
    var bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('gulp wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }

    // wire Bower packages to .html
    wiredep({
      bowerJson: bowerJson,
      directory: 'bower_components',
      exclude: ['bootstrap-sass', 'bootstrap.js'],
      ignorePath: /^(\.\.\/)*\.\./,
      src: 'app/index.html'
    });

    if (this.includeSass) {
      // wire Bower packages to .scss
      wiredep({
        bowerJson: bowerJson,
        directory: 'bower_components',
        ignorePath: /^(\.\.\/)+/,
        src: 'app/styles/*.scss'
      });
    }

  }
});
