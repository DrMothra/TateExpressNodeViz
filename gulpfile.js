/**
 * Created by atg on 13/02/2017.
 */

var gulp = require('gulp');
var gutil = require('gulp-util');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');

gulp.task('build', function() {
    return gulp.src('./views/start.ejs')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('build'));
});
