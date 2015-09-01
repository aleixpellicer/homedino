'use strict';

var config       = require('../config');
var gulp         = require('gulp');
var gulpif       = require('gulp-if');
var gutil        = require('gulp-util');
var watchify     = require('watchify');
var streamify    = require('gulp-streamify'); // gulp-uglify no soporta streams, streamify converteix a stream
var browserify   = require('browserify');
var uglify       = require('gulp-uglify'); // comprimeix js
var handleErrors = require('../util/handleErrors');
var ngAnnotate   = require('browserify-ngannotate'); // perq funcioni al fer uglify: myApp.controller('MyCtrl', ['$q', function($q) {}]);
var browserSync  = require('browser-sync');
// maybe i can delete
var source       = require('vinyl-source-stream'); // converteix a stream pq browserify pugui llegir


function buildScript(file) {

  var bundler = browserify({
    entries: config.browserify.entries,
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  }, watchify.args);

  if ( !global.isProd ) {
    bundler = watchify(bundler);
    bundler.on('update', function() {
      rebundle();
    });
  }

  var transforms = [
    'bulkify',
    ngAnnotate
  ];

  // bulkify, permet a browserify entendre els bulk require

  transforms.forEach(function(transform) {
    bundler.transform(transform);
  });

  function rebundle() {
    var stream = bundler.bundle();

    gutil.log('Rebundle...');
    return stream.on('error', handleErrors)
      .pipe(source(file))
      .pipe(gulpif(global.isProd, streamify(uglify({
        compress: { drop_console: true }
      }))))
      .pipe(gulp.dest(config.scripts.dest))
      .pipe(gulpif(browserSync.active, browserSync.reload({ stream: true, once: true })));
  }
  return rebundle();
}

gulp.task('browserify', function() {
  return buildScript('main.js');
});
