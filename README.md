# Ninthlink Web app generator [![Build Status](https://secure.travis-ci.org/jeffreysbrother/generator-ninthlink.svg?branch=master)](http://travis-ci.org/jeffreysbrother/generator-ninthlink) [![Join the chat at https://gitter.im/jeffreysbrother/generator-ninthlink](https://badges.gitter.im/jeffreysbrother/generator-ninthlink.svg)](https://gitter.im/jeffreysbrother/generator-ninthlink?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> [Yeoman](http://yeoman.io) generator that scaffolds out a front-end web app using [gulp](http://gulpjs.com/) for the build process. A modified version of [this generator](https://github.com/yeoman/generator-webapp).


## Features

Please see the [gulpfile](app/templates/gulpfile.js) for up-to-date information on what we support.

* Bootstrap, Sass, and HTML5 Boilerplate (jQuery, Normalize.css, etc.)
* UnCSS (customized for use with Bootstrap)
* JS, CSS, and HTML Minification
* CSS Autoprefixing
* Built-in preview server with BrowserSync
* Compile Sass with [libsass](http://libsass.org)
* Lint your scripts
* Lint Bootstrap HTML with gulp-bootlint
* Source maps
* Image optimization
* Git initialization
* Choose between Google Tag Manager and Google Analytics
* Wire-up dependencies installed with [Bower](http://bower.io)
* The gulpfile makes use of [ES2015 features](https://babeljs.io/docs/learn-es2015/) by using [Babel](https://babeljs.io)
* Many other customizations...

*For more information on what this generator can do for you, take a look at the [gulp plugins](app/templates/_package.json) used in our `package.json`.*


## libsass

Keep in mind that libsass is feature-wise not fully compatible with Ruby Sass. Check out [this](http://sass-compatibility.github.io) curated list of incompatibilities to find out which features are missing.

If your favorite feature is missing and you really need Ruby Sass, you can always switch to [gulp-ruby-sass](https://github.com/sindresorhus/gulp-ruby-sass) and update the `styles` task in gulpfile accordingly.


## Getting Started

- Install [Node](https://nodejs.org/en/)
- Install other dependencies: `npm install --global yo gulp-cli bower`
- Install the generator: `npm install --global generator-ninthlink`
- Run `yo ninthlink` to scaffold your web app
- Run `gulp serve` to preview and watch for changes
<!-- - Run `bower install --save <package>` to install front-end dependencies -->
- Run `gulp serve:test` to run the tests in the browser
- Run `gulp` to build your web app for production
- Run `gulp serve:dist` to preview the production build


## Additional Tasks

- Run `gulp bootlint` to lint Bootstrap markup. This is currently a standalone task and will only lint the index.html file in the app/ directory. Feel free to customize as necessary.


## Docs

* [getting started](docs/README.md) with this generator
* [recipes](docs/recipes/README.md) for integrating other popular technologies like CoffeeScript
* [details](docs/bower.md) about our Bower setup
* [contribution](contributing.md) docs and [FAQ](docs/faq.md), good to check before posting an issue


## Options

- `--skip-welcome-message`
  Skips Yeoman's greeting before displaying options.
- `--skip-install-message`
  Skips the the message displayed after scaffolding has finished and before the dependencies are being installed.
- `--skip-install`
  Skips the automatic execution of `bower` and `npm` after scaffolding has finished.
- `--test-framework=<framework>`
  Either `mocha` or `jasmine`. Defaults to `mocha`.
- `--no-babel`
  Scaffolds without [Babel](http://babeljs.io) support (this only applies to `app/scripts`, you can still write ES2015 in the gulpfile)


## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
