var gulp = require('gulp');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');
var gutil = require("gulp-util");

var onError = function (err) {
    gutil.beep();
    console.log(err);
    this.emit('end');
};

gulp.task('test', function () {
    return gulp.src(['test/tests/**/*.js'], {
        read: false
    }).pipe(plumber({
        errorHandler: onError
    })).pipe(mocha({
        timeout: 5000,
        reporter: 'nyan'
    }));
});

gulp.task('default', ['test'], function () {
    gulp.watch(['./lib/**/*.js', './test/**/*.js'], ['test']);
});