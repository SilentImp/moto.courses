const gulp = require('gulp')
  , fs = require('fs')
  , path = require('path')
  , critical = require('critical')
  , babel = require('gulp-babel')
  , pug = require('gulp-pug')
  , sprite = require('gulp-svgsprite')
  , cheerio = require('gulp-cheerio')
  , svgmin = require('gulp-svgmin')
  , replace = require('gulp-replace')
  , htmlclean = require('gulp-htmlclean')
  , gulpif = require('gulp-if')
  , eslint = require('gulp-eslint')
  , rename = require('gulp-rename')
  , concat = require('gulp-concat')
  , sourcemaps = require('gulp-sourcemaps')
  , purify = require('gulp-purifycss')
  , postcss = require('gulp-postcss')
  , stylint = require('gulp-stylint')
  , puglint = require('gulp-pug-lint')
  , order = require('gulp-order')
  , imagemin = require('gulp-imagemin')
  , gm = require('gm').subClass({imageMagick: true})
  , ggm = require('gulp-gm')
  , uglify = require('gulp-uglify')
  , imageResize = require('gulp-image-resize')
  , glob = require('glob-array')
  , browserify = require('browserify')
  , source = require('vinyl-source-stream')
  , buffer = require('vinyl-buffer')
  , resizeImageTasks = []
  , paths = {
    source: {
      images: ['./source/components/**/*.jpg', './source/components/**/*.png']
    , components_css: './source/components/**/*.css'
    , all_css: ['./source/components/**/*.css', './source/helpers/**/*.css']
    , all_js: ['./source/components/**/*.js']
    , js: './source/components/**/javascript/**/*.js'
    , jss: './source/components/**/javascript-unmergable/**/*.js'
    , html: './source/pages/**/*.pug'
    , all_html: ['./source/pages/**/*.pug', './source/components/**/*.pug']
    , sprite: './source/svg-sprites/**/*.svg'
    , fonts: ['./source/fonts/**/*.woff', './source/fonts/**/*.woff2']
    , server: './server_source/*.js'
    , favicon: './source/favicon/**/*'
    , static: './source/static/**/*'
    , blur: ['./build/images/*.jpg', './build/images/*.png']
    , criticalSource: './build/styles/styles.css'
    }
  , build: {
    build: './build/'
    , critical: './build/styles/'
    , sprite: './source/tmp/'
    , css: './build/styles/'
    , images: './build/images/'
    , fonts: './build/fonts/'
    , js: './build/javascript/'
    , favicon: './build/'
    , server: './server/'
    , static: './build/'
  }
  };

gulp.task('sprite', function () {
  return gulp.src(paths.source.sprite)
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[style]').removeAttr('style');
      }
      , parserOptions: {xmlMode: true}
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(sprite({
      inlineSvg: true
      , preview: false
      , mode: 'symbols'
      , metaAttrs: ['width', 'height', 'fill']
      , cleanAttrs: ['fill', 'style']
    }))
    .pipe(gulp.dest(paths.build.sprite));
});

gulp.task('lint:pug', function () {
  return gulp.src(paths.source.all_html)
    .pipe(puglint({failOnError: true}));
});

gulp.task('html', ['lint:pug'], function () {
  console.log(path.resolve(__dirname, './build/styles/'));
  return gulp.src(paths.source.html)
    .pipe(pug({}))
    .pipe(htmlclean({}))
    .pipe(gulp.dest(paths.build.build));
});

gulp.task('lint:css', function () {
  let plugins = [
    require('stylelint')
    , require('postcss-reporter')({
      throwError: true
    })
  ];

  return gulp.src([paths.source.components_css, '!./**/reset.css'])
    .pipe(postcss(plugins, {failOnError: true}));
});

gulp.task('css', ['lint:css', 'html'], function () {
  let plugins = [
    require('precss')
    , require('autoprefixer')
    , require('postcss-discard-empty')
    , require('postcss-clean')
  ];

  return gulp.src(paths.source.components_css)
    .pipe(postcss(plugins))
    .pipe(order(['reset.css']))
    .pipe(concat('styles.css'))
    .pipe(purify(['./build/**/*.js', './build/*.html'], {
      minify: true
      , info: true
    }))
    .pipe(gulp.dest(paths.build.css));
});

gulp.task('critical', ['css'], function () {
  critical.generate({
    inline: true
    , base: 'build/'
    , src: 'index.html'
    , dest: 'index.html'
    , ignore: ['@font-face', /url\(/]
    , minify: true
    , dimensions: [{
      height: 500
      , width: 320
    }, {
      height: 800
      , width: 1200
    }]
  });
});

// gulp.task('javascript', ['lint:js'], function () {
//   return gulp.src(paths.source.js)
//     .pipe(babel({
//       presets: ['latest']
//     }))
//     .pipe(concat('scripts.js'))
//     .pipe(uglify())
//     .pipe(gulp.dest(paths.build.js));
// });

gulp.task('javascript', ['lint:js'], function () {
  const files = glob.sync([paths.source.js]);
  browserify({entries: files, extensions: ['.js']})
    .transform('babelify', {presets: ['env', 'stage-1']})
    .bundle()
    .pipe(source('scripts.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(paths.build.js));
});

gulp.task('lint:js', function () {
  return gulp.src(paths.source.js)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('javascript-standalone', function () {
  return gulp.src(paths.source.jss)
  // .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['latest']
    }))
    .pipe(uglify())
    .pipe(rename({dirname: ''}))
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.build.build));
});

gulp.task('fonts', function () {
  return gulp.src(paths.source.fonts)
    .pipe(gulp.dest(paths.build.fonts));
});

gulp.task('image:min', function () {
  return gulp.src(paths.source.images, {base: './'})
    .pipe(imagemin({
      interlaced: true
      , progressive: true
      , optimizationLevel: 5
    }))
    .pipe(rename({dirname: ''}))
    .pipe(gulp.dest('./build/images/'));
});

[1270, 676, '676-blured'].forEach(function (size) {
  const resizeImageTask = 'resize_' + size
    , blured = (size.toString().indexOf('-blured') > -1);

  size = parseInt(size, 10);

  gulp.task(resizeImageTask, function () {
    return gulp.src(paths.source.images)
    .pipe(imageResize({
      width: size
      , imageMagick: false
      , upscale: false
    }))
    .pipe(rename({dirname: '', suffix: (size == 1270) ? '@2x' : blured ? '@blured' : ''}))
    .pipe(gulpif(blured, ggm(function (gmfile, done) {
      gmfile.size(function (err, size) {
        const part = 5
            , window_size = Math.round(Math.min(size.width, size.height) / part);
        done(null, gmfile.blur(window_size, Math.round(window_size / part)));
      });
    })))
    .pipe(imagemin({
      interlaced: true
      , progressive: true
      , optimizationLevel: 5
    }))
    .pipe(gulp.dest(paths.build.images));
  });
  resizeImageTasks.push(resizeImageTask);
});

gulp.task('image:resize', resizeImageTasks);

gulp.task('favicon', function () {
  return gulp.src(paths.source.favicon)
    .pipe(gulp.dest(paths.build.favicon));
});

gulp.task('static', function () {
  return gulp.src(paths.source.static)
    .pipe(rename({dirname: ''}))
    .pipe(gulp.dest(paths.build.static));
});

gulp.task('default', ['javascript'], function () {
  gulp.watch(paths.source.js, ['javascript']);
});

gulp.task('build', ['fonts', 'javascript', 'javascript-standalone', 'critical', 'image:resize', 'favicon', 'static']);

gulp.task('watch', function () {
  gulp.watch(paths.source.all_js, ['javascript', 'javascript-standalone']);
  gulp.watch(paths.source.all_css, ['css']);
  gulp.watch(paths.source.all_html, ['html']);
});

gulp.task('server', function () {
  return gulp.src(paths.source.server)
    .pipe(babel({
      presets: ['latest']
    }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.build.server));
});
