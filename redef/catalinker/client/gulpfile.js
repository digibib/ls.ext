/*global require*/
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var del = require('del');

gulp.task('browserify', ['clean', 'images', 'html'], function () {
  "use strict";
  var b = browserify({
    entries: ['src/main.js', 'src/ontology.js', 'src/graph.js', 'src/stringutil.js'],
    debug: true
  });
  return b
  .require('./src/main.js', {expose: "main"})
  .require('./src/ontology.js', {expose: "ontology"})
  .require('./src/graph.js', {expose: "graph"})
  .require('./src/stringutil.js', {expose: "stringutil"})
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(uglify())
  .on('error', gutil.log)
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('public/js/'));
});

gulp.task('html', function () {
  return gulp.src('src/*.html')
      .pipe(gulp.dest('public'));
});

gulp.task('images', function () {
  return gulp.src('src/*.png')
      .pipe(gulp.dest('public'));
});

gulp.task('clean', function () {
  return del([
      'public/js/*.js', 'public/*.html'
  ]);
});

gulp.task('watch', ['clean','browserify'], function () {
  gulp.watch(['src/*.html'], ['html']);
  gulp.watch(['src/*.js'], ['browserify']);
});

gulp.task('default', ['build', 'watch']);
gulp.task('build', ['clean', 'images', 'html', 'browserify']);
