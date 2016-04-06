var gulp = require('gulp'),
  babelify = require('babelify'),
  browserify = require('browserify'),
  standard = require('gulp-standard'),
  source = require('vinyl-source-stream'),
  del = require('del'),
  sass = require('gulp-sass'),
  server = require('gulp-express')

gulp.task('lint', function () {
  return gulp.src([ './src/frontend/**/*.js', './src/backend/**/*.js', './test/**/*.js' ])
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true
    }))
})

gulp.task('clean', function () {
  return del.sync([ 'public/dist' ])
})

gulp.task('build', [ 'clean', 'sass' ], function () {
  return browserify({
    entries: './src/frontend/main.js',
    extensions: [ '.jsx' ],
    debug: true
  })
    .transform(babelify, { presets: [ 'es2015', 'react' ] })
    .bundle()
    .on('error', function (err) {
      console.log(err.message);
      this.emit('end');
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('public/dist'))
})

gulp.task('sass', function () {
  return gulp.src('./src/sass/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('public/css'))
})

gulp.task('reload:js', [ 'build' ], function () {
  return gulp.src('./src/').pipe(server.notify())
})

gulp.task('reload:sass', [ 'sass' ], function () {
  return gulp.src('./src/').pipe(server.notify())
})

gulp.task('watch', function () {
  gulp.watch([ './src/frontend/**/*.js' ], [ 'reload:js' ])
  gulp.watch([ './src/scss/**/*.scss' ], [ 'reload:sass' ])
  gulp.watch([ './src/backend/server.js' ], [ server.run ])
})

gulp.task('express', function () {
  server.run([ './src/backend/server.js' ])
})

gulp.task('serve', [ 'build', 'watch', 'express' ])
