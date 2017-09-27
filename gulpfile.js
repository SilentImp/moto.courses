const gulp = require('gulp')
  , fs = require('fs')
  , inline = require('inline-critical')
  , path = require('path')
  , criticalCss = require('gulp-penthouse')
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
  , postcss = require('gulp-postcss')
  , stylint = require('gulp-stylint')
  , puglint = require('gulp-pug-lint')
  , order = require('gulp-order')
  , imagemin = require('gulp-imagemin')
  , gm = require('gm').subClass({imageMagick: true})
  , ggm = require('gulp-gm')
  , uglify = require('gulp-uglify')
  , imageResize = require('gulp-image-resize')
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
      , parserOptions: { xmlMode: true }
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

gulp.task('html', ['critical:main'], function () {
  console.log(path.resolve(__dirname, './build/styles/'));
  return gulp.src(paths.source.html)
    .pipe(pug({}))
    .pipe(htmlclean({}))
    // .pipe(procss({ base: path.resolve(__dirname, './build/styles/') }))
    .pipe(gulp.dest(paths.build.build));
});

gulp.task('html:critical', ['html'], function () {
  const html = fs.readFileSync(path.resolve(__dirname, './build/index.html'), 'utf8');
  const critical = fs.readFileSync(path.resolve(__dirname, './build/styles/critical.css'), 'utf8');
  fs.writeFileSync(path.resolve(__dirname, './build/index.html'), inline(html, critical));
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

gulp.task('css', ['lint:css'], function () {
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
    .pipe(gulp.dest(paths.build.css));
});

gulp.task('critical:main', ['css'], function () {
  return gulp.src(paths.source.criticalSource)
    .pipe(criticalCss({
      out: 'critical.css'
        , url: 'http://moto.courses/'
        , width: 1300
        , height: 900
        , strict: true
        , userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    }))
    .pipe(gulp.dest(paths.build.critical));
});

gulp.task('javascript', ['lint:js'], function () {
  return gulp.src(paths.source.js)
    .pipe(babel({
      presets: ['latest']
    }))
    .pipe(concat('scripts.js'))
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
  return gulp.src(paths.source.images, { base: './' })
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

gulp.task('build', ['fonts', 'javascript', 'javascript-standalone', 'html:critical', 'image:resize', 'favicon', 'static']);

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
