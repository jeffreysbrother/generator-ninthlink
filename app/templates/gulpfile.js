// generated on <%= date %> using <%= name %> <%= version %>
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const wiredep = require('wiredep').stream;
const argv = require('yargs').argv;

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var customPort = 9000;
var customDir = '';
var customAppDir = customDir + 'app';
var customDistDir = customDir + 'dist';

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
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))<% } else { %>
  return gulp.src(customAppDir + 'styles/*.css')
    .pipe($.sourcemaps.init())<% } %>
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(customDir + '.tmp/styles'))
    .pipe(reload({stream: true}));
});

<% if (includeBabel) { -%>
gulp.task('scripts', () => {
  return gulp.src(customAppDir + '/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(customDir + '.tmp/scripts'))
    .pipe(reload({stream: true}));
});
<% } -%>

function lint(files, options) {
  return gulp.src(files)
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint(options))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint(customAppDir + '/scripts/**/*.js', {
    fix: true
  })
    .pipe(gulp.dest(customAppDir + '/scripts'));
});
gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js', {
    fix: true,
    env: {
<% if (testFramework === 'mocha') { -%>
      mocha: true
<% } else if (testFramework === 'jasmine') { -%>
      jasmine: true
<% } -%>
    }
  })
    .pipe(gulp.dest('test/spec/**/*.js'));
});

<% if (includeBabel) { -%>
gulp.task('html', ['styles', 'scripts'], () => {
<% } else { -%>
gulp.task('html', ['styles'], () => {
<% } -%>
  return gulp.src(customAppDir + '/*.html') 
    .pipe($.useref({searchPath: [customDir + '.tmp', customAppDir, customDir + '.']}))
    .pipe($.if('*.js', $.uglify()))
    <% if (includeUncss) { -%>
    .pipe($.if('*.css', $.uncss({
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
    .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false, discardComments: {removeAll: true}})))
    .pipe($.if('*.html', $.htmlmin({collapseBooleanAttributes: true, collapseWhitespace: true, removeComments: true})))
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
    .pipe(gulp.dest(customDir + '.tmp/fonts'))
    .pipe(gulp.dest(customDistDir + '/fonts'));
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

<% if (includeBabel) { -%>
gulp.task('serve', ['styles', 'scripts', 'fonts'], () => {
<% } else { -%>
gulp.task('serve', ['styles', 'fonts'], () => {
<% } -%>
  browserSync({
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

gulp.task('serve:dist', () => {
  browserSync({
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
  browserSync({
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
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {<% if (includeSass) { %>
  gulp.src(customAppDir + '/styles/*.scss')
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
        var message = (isError) ? "ERROR! - " : "WARN! - ";
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

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});

// new cp task
gulp.task('cp', function() {
  var destfrom = 'app';
  var destto = 'dist';

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
