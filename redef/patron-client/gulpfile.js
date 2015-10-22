'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var factor = require('factor-bundle');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var del = require('del');
var child = require('child_process');
var fs = require('fs');



gulp.task('browserify', ['clean', 'placeholders', 'images', 'html'], function () {
    var b = browserify({
        entries: ['src/search.js', 'src/person.js', 'src/work.js'],
        debug: true
    });
    b.plugin(factor, {outputs: ['public/js/search.js', 'public/js/person.js', 'public/js/work.js']})
    return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/js/'))
});

gulp.task('serve', function() {
    var server = child.spawn('node', ['server.js']);
    var log = fs.createWriteStream('server.log', {flags: 'a'});
    server.stdout.pipe(log);
    server.stderr.pipe(log);
});

gulp.task('html', function () {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('public'))
});

gulp.task('images', function () {
    return gulp.src('src/*.png')
        .pipe(gulp.dest('public'))
});

gulp.task('clean', function () {
    return del([
        'public/js/*.js', 'public/*.html'
    ]);
});

gulp.task('placeholders', function () {
    gulp.src(['src/search.js', 'src/person.js', 'src/work.js'])
    .pipe(gulp.dest('public/js'))
});

gulp.task('watch', ['clean','browserify'], function () {
    gulp.watch(['src/*.html'], ['html'])
    gulp.watch(['src/*.js'], ['browserify']);
});

gulp.task('default', ['build', 'serve', 'watch']);
gulp.task('build', ['clean', 'images', 'html', 'browserify']);
