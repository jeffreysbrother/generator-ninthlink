// generated on <%= date %> using <%= name %> <%= version %>
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const wiredep = require('wiredep').stream;
const argv = require('yargs').argv;
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

let dev = true;

let customPort = 9000;
let customDir = '';
let customAppDir = customDir + 'app';
let customDistDir = customDir + 'dist';

if (argv.from) {
  customDir = argv.from +'/';
}
if (argv.appDir) {
  customAppDir = customDir + argv.appDir;
}
if (argv.distDir) {
  customDistDir = customDir + argv.distDir;
}

gulp.task('styles', () => {<% if (includeSass) { %>
  return gulp.src( customAppDir + '/styles/*.scss')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError)))<% } else { %>
  return gulp.src(customAppDir + 'styles/*.css')
    .pipe($.if(dev, $.sourcemaps.init()))<% } %>
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest(customDir + '.tmp/styles'))
    .pipe(reload({stream: true}));
});

<% if (includeBabel) { -%>
gulp.task('scripts', () => {
  return gulp.src(customAppDir + '/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write('.')))
    .pipe(gulp.dest(customDir + '.tmp/scripts'))
    .pipe(reload({stream: true}));
});
<% } -%>

function lint(files) {
  return gulp.src(files)
    .pipe($.eslint({ fix: true }))
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint(customAppDir + '/scripts/**/*.js')
    .pipe(gulp.dest(customAppDir + '/scripts'));
});
gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js')
    .pipe(gulp.dest('test/spec'));
});

<% if (includeBabel) { -%>
gulp.task('html', ['styles', 'scripts'], () => {
<% } else { -%>
gulp.task('html', ['styles'], () => {
<% } -%>
  return gulp.src(customAppDir + '/*.html')
    .pipe($.useref({searchPath: [customDir + '.tmp', customAppDir, customDir + '.']}))
    .pipe($.if(/\.js/, $.uglify({compress: {drop_console: true}})))
    <% if (includeUncss) { -%>
    .pipe($.if(/\.css/, $.uncss({
            html: [customAppDir + '/index.html'],
            ignore: [/\w\.in/,
                    '.fade',
                    '.collapse',
                    '.collapsing',
                    /(#|\.)navbar(\-[a-zA-Z]+)?/,
                    /(#|\.)dropdown(\-[a-zA-Z]+)?/,
                    /(#|\.)(open)/,
                    /(#|\.)carousel(\-[a-zA-Z]+)?/,
                    '.modal',
                    '.modal.fade.in',
                    '.modal-dialog',
                    '.modal-document',
                    '.modal-scrollbar-measure',
                    '.modal-backdrop.fade',
                    '.modal-backdrop.in',
                    '.modal.fade.modal-dialog',
                    '.modal.in.modal-dialog',
                    '.modal-open',
                    '.in',
                    '.modal-backdrop']
        })))
    <% } -%>
    .pipe($.if(/\.css/, $.cssnano({safe: true, autoprefixer: false, discardComments: {removeAll: true}})))
    .pipe($.if(/\.html/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(gulp.dest(customDistDir));
});

gulp.task('images', () => {
  return gulp.src(customAppDir + '/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest(customDistDir + '/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat(customAppDir + '/fonts/**/*'))
    .pipe($.if(dev, gulp.dest(customDir + '.tmp/fonts'), gulp.dest(customDistDir + '/fonts')));
});

gulp.task('extras', () => {
  return gulp.src([
    customAppDir + '/*.*',
    customDir + '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest(customDistDir));
});

gulp.task('clean', del.bind(null, [customDir + '.tmp', customDistDir]));

// gulp.task('clean:tmp', del.bind(null, [ customDir +'.tmp']));

gulp.task('serve', () => {
  runSequence(['clean', 'wiredep'], ['styles'<% if (includeBabel) { %>, 'scripts'<% } %>, 'fonts'], () => {
    browserSync.init({
      notify: false,
      port: customPort,
      server: {
        baseDir: [customDir + '.tmp', customAppDir],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

  gulp.watch([
    customAppDir + '/*.html',
<% if (!includeBabel) { -%>
    customAppDir + '/scripts/**/*.js',
<% } -%>
    customAppDir + '/images/**/*',
    customDir + '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch(customAppDir + '/styles/**/*.<%= includeSass ? 'scss' : 'css' %>', ['styles']);
<% if (includeBabel) { -%>
  gulp.watch(customAppDir + '/scripts/**/*.js', ['scripts']);
<% } -%>
  gulp.watch(customAppDir + '/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});
});

gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    port: customPort,
    server: {
      baseDir: [customDistDir]
    }
  });
});

<% if (includeBabel) { -%>
gulp.task('serve:test', ['scripts'], () => {
<% } else { -%>
gulp.task('serve:test', () => {
<% } -%>
  browserSync.init({
    notify: false,
    port: customPort,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
<% if (includeBabel) { -%>
        '/scripts': customDir + '.tmp/scripts',
<% } else { -%>
        '/scripts': customAppDir + '/scripts',
<% } -%>
        '/bower_components': 'bower_components'
      }
    }
  });

<% if (includeBabel) { -%>
  gulp.watch(customAppDir + '/scripts/**/*.js', ['scripts']);
<% } -%>
  gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {<% if (includeSass) { %>
  gulp.src(customAppDir + '/styles/*.scss')
    .pipe($.filter(file => file.stat && file.stat.size))
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest(customAppDir + '/styles'));
<% } %>
  gulp.src(customAppDir + '/*.html')
    .pipe(wiredep({<% if (includeBootstrap) { if (includeSass) { %>
      exclude: ['bootstrap-sass'],<% } else { %>
      exclude: ['bootstrap.js'],<% }} %>
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('bootlint', function() {
  return gulp.src(customAppDir + '/index.html')
    .pipe($.bootlint({
      reportFn: function(file, lint, isError, isWarning, errorLocation) {
        let message = (isError) ? 'ERROR! - ' : 'WARN! - ';
        if (errorLocation) {
          message += ' (line:' + (errorLocation.line + 1) + ', col:' + (errorLocation.column + 1) + ') [' + lint.id + '] ' + lint.message;
        } else {
          message += ': ' + lint.id + ' ' + lint.message;
        }
        console.log(message);
      }
    }));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src(customDistDir + '/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean', 'wiredep'], 'build', resolve);
  });
});

// new cp task
gulp.task('cp', function() {
  let destfrom = 'app';
  let destto = 'dist';

  if (argv.from) {
    if (argv.to) {
      destto = argv.to;
    } else {
      // default is load from ___ to app
      destto = destfrom;
    }
    destfrom = argv.from;
  } else {
    if (argv.to) {
      destfrom = destto;
      destto = argv.to;
    }
  }

  if ((destfrom == 'app') && (destto == 'dist')) {
    console.log('Usage: gulp cp --from someplace --to someplace');
  } else {
    console.log('copy from '+ destfrom +' to '+ destto );
    gulp.src([ destfrom +'/**/*']).pipe(gulp.dest(destto));
  }
});
