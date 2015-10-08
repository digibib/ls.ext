'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var del = require('del');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var exec = require('child_process').exec;

gulp.task('javascript', function () {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: ['src/search.js'],
        debug: true
    });

    return b.bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/js'))
});

/* If livereloading does not work, make sure you access the page via the correct address (e.g. localhost instead of 127.0.0.1), because of same-origin policy. */
gulp.task('serve', function() {
    browserSync({
        server: {
            baseDir: 'public'
        },
        notify: false,
        open: false,
        port: 8000,
        ui: false,
        host: 'redef_patron_client_skeleton_container'
    });

    gulp.watch(['*.html', 'js/*.js'], {cwd: 'public'}, reload);
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
        'public/*',
    ]);
});

gulp.task('watch', function () {
    gulp.watch(['src/*.html'], ['html']);
    gulp.watch(['src/*.js'], ['javascript']);
});

gulp.task('default', ['clean', 'serve', 'images', 'javascript', 'html', 'watch']);
gulp.task('build', ['clean', 'images', 'javascript', 'html']);
