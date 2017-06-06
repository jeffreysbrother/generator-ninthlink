'use strict';
const Generator = require('yeoman-generator');
const commandExists = require('command-exists').sync;
const yosay = require('yosay');
const chalk = require('chalk');
const wiredep = require('wiredep');
const mkdirp = require('mkdirp');
const _s = require('underscore.string');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

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
  }

  initializing() {
    this.pkg = require('../package.json');
    this.composeWith(
      require.resolve(`generator-${this.options['test-framework']}/generators/app`),
      { 'skip-install': this.options['skip-install'] }
    );
  }

  prompting() {
    if (!this.options['skip-welcome-message']) {

      // commented out becasue this dumps the message AND the default ASCII ART
      this.log(yosay('Yo Ninthlink! Out of the box I include HTML5 Boilerplate, jQuery, UnCSS, and many more useful tools.'));
    }

    const prompts = [{
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
      when: answers => answers.features.indexOf('includeBootstrap') === -1
    }];

    return this.prompt(prompts).then(answers=> {
      const { features } = answers;
      const hasFeature = feat => features && features.indexOf(feat) !== -1;

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeSass = hasFeature('includeSass');
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');
      this.includeTagManager = hasFeature('includeTagManager');
      this.includeUncss = hasFeature('includeUncss');
      this.includeJQuery = answers.includeJQuery;

    });
  }

  writing() {
    this._writingGulpfile();
    this._writingPackageJSON();
    this._writingBabel();
    this._writingHtaccess();
    this._writingGit();
    this._writingBower();
    this._writingEditorConfig();
    this._writingH5bp();
    this._writingStyles();
    this._writingScripts();
    this._writingHtml();
    this._writingMisc();
  }

    _writingGulpfile() {
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
    }

    _writingPackageJSON() {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          includeSass: this.includeSass,
          includeUncss: this.includeUncss,
          includeBabel: this.options['babel']
        }
      );
    }

    _writingBabel() {
      this.fs.copy(
        this.templatePath('babelrc'),
        this.destinationPath('.babelrc')
      );
    }

    _writingHtaccess() {
      this.fs.copy(
        this.templatePath('htaccess'),
        this.destinationPath('app/.htaccess')
      );
    }

    _writingGit() {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore'));

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes'));
    }

    _writingBower() {
      const bowerJson = {
        name: _s.slugify(this.appname),
        private: true,
        dependencies: {}
      };

      if (this.includeBootstrap) {
        if (this.includeSass) {
          bowerJson.dependencies = {
            'bootstrap-sass': '~3.3.5'
          };
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
          bowerJson.dependencies = {
            'bootstrap': '~3.3.5'
          };
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
    }

    _writingEditorConfig() {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
    }

    _writingH5bp() {
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
    }

    _writingStyles() {
      let css = 'main';

      if (this.includeSass) {
        css += '.scss';
        let header_partial = '_header.scss';
        let footer_partial = '_footer.scss';
        let variables_partial = '_variables.scss';
        let components_partial = '_components.scss';
        let utilities_partial = '_utilities.scss';

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

    }


    _writingScripts() {
      this.fs.copy(
        this.templatePath('main.js'),
        this.destinationPath('app/scripts/main.js')
      );
    }

    _writingHtml() {
      let bsPath, bsPlugins;

      // path prefix for Bootstrap JS files
      if (this.includeBootstrap) {
        bsPath = '/bower_components/bootstrap/js/dist/';
        bsPlugins = [
          'util',
          'alert',
          'button',
          'carousel',
          'collapse',
          'dropdown',
          'modal',
          'scrollspy',
          'tab',
          'tooptip',
          'popover'
        ];

        if (this.includeSass) {
          bsPath += '/bower_components/bootstrap-sass/assets/javascripts/bootstrap/';
        } else {
          bsPath += '/bower_components/bootstrap/js/';
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
          bsPlugins: bsPlugins
        }
      );
    }

    _writingMisc() {
      mkdirp('app/images');
      mkdirp('app/fonts');
      // initialize Git repo prior to installing dependencies,
      // so it still works if the user skips dependency installation
      this.spawnCommandSync('git', ['init']);
    }

  install() {
    const hasYarn = commandExists('yarn');
    this.installDependencies({
      npm: !hasYarn,
      bower: true,
      yarn: hasYarn,
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  }

  end() {
    const bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    const howToInstall =
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
}
