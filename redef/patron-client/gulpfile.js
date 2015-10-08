'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var del = require('del');
var child = require('child_process');
var fs = require('fs');


gulp.task('javascript', function () {
    var b = browserify({
        entries: ['src/search.js'],
        debug: true
    });

    return b.bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/js'))
});

gulp.task('serve', function() {
    var server = child.spawn('node', ['server.js']);
    var log = fs.createWriteStream('server.log', {flags: 'a'});
    server.stdout.pipe(log);
    server.stderr.pipe(log);
});

gulp.task('html', function () {
    gulp.src('src/*.html')
        .pipe(gulp.dest('public'))
});

gulp.task('images', function () {
    gulp.src('src/*.png')
        .pipe(gulp.dest('public'))
});

gulp.task('clean', function () {
    return del([
        'public/*'
    ]);
});

gulp.task('watch', function () {
    gulp.watch(['src/*.html'], ['html']);
    gulp.watch(['src/*.js'], ['javascript']);
});

gulp.task('default', ['clean', 'serve', 'images', 'javascript', 'html', 'watch']);
gulp.task('build', ['clean', 'images', 'javascript', 'html']);
