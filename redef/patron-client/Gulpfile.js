var gulp = require('gulp'),
  babelify = require('babelify'),
  browserify = require('browserify'),
  standard = require('gulp-standard'),
  connect = require('gulp-connect'),
  source = require('vinyl-source-stream'),
  del = require('del'),
  sass = require('gulp-sass'),
  history = require('connect-history-api-fallback')

gulp.task('lint', function () {
  return gulp.src(['./src/frontend/**/*.js'])
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true
    }))
})

gulp.task('clean', function () {
  return del.sync(['public/dist'])
})

gulp.task('build', ['clean', 'copy:md', 'sass'], function () {
  return browserify({
    entries: './src/frontend/main.js',
    extensions: ['.jsx'],
    debug: true
  })
    .transform(babelify, {presets: ['es2015', 'react']})
    .bundle()
    .on('error', function (err) {
      console.log(err.message);
      this.emit('end');
    })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('public/dist'))
})

gulp.task('copy:md', function () {
  console.log('derp')
  return gulp.src('./src/text/**/*.md').pipe(gulp.dest('public/dist'))
})

gulp.task('sass', function () {
  return gulp.src('./src/sass/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('public/css'))
})

gulp.task('reload:js', ['build'], function () {
  return gulp.src('./src/').pipe(connect.reload())
})

gulp.task('reload:md', ['copy:md'], function () {
  return gulp.src('./src/').pipe(connect.reload())
})

gulp.task('reload:sass', ['sass'], function () {
  return gulp.src('./src/').pipe(connect.reload())
})

gulp.task('watch', function () {
  gulp.watch(['./src/frontend/**/*.js'], ['reload:js'])
  gulp.watch(['./src/text/**/*.md'], ['reload:md'])
  gulp.watch(['./src/scss/*.scss'], ['reload:sass'])
})

gulp.task('connect', function () {
  connect.server({
    root: './public',
    port: 8000,
    livereload: true,
    middleware: function () {
      return [history()]
    }

  })
})

gulp.task('serve', ['build', 'watch', 'connect'])