const gulp = require('gulp');
const babel = require('gulp-babel');
const paths = {
    source: {
        js: "./source/**/*.js"
    },
    build: {
        build: "./build/"
    }
}

gulp.task('javascript', function() {
	return gulp.src(paths.source.js)
        .pipe(babel({
            presets: ['modern-node']
        }))
        .pipe(gulp.dest(paths.build.build));
});

gulp.task('default', ['javascript'], function() {
    gulp.watch(paths.source.js, ['javascript']);
});