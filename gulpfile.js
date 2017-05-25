var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('css', function(){
    gulp.src([
        "./node_modules/materialize-css/dist/css/materialize.min.css",
        "./src/css/**/*.css"
    ])
        .pipe(concat('style.css'))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('js', function() {
    gulp.src([
        "./node_modules/jquery/dist/jquery.min.js",
        "./node_modules/angular/angular.min.js",
        "./node_modules/chart.js/dist/Chart.min.js",
        "./node_modules/angular-chart.js/dist/angular-chart.min.js",
        "./node_modules/materialize-css/dist/js/materialize.min.js",
        "./node_modules/socket.io-client/dist/socket.io.slim.js",
        "./node_modules/angu-fixed-header-table/angu-fixed-header-table.js",
        "./node_modules/dateformat/lib/dateformat.js",
        "./src/js/controller.js"
    ])
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('html', function () {
    gulp.src('./src/**/*.html')
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', function() {
    gulp.start(['css', 'js', 'html']);
});

gulp.task('watch', function(){
    gulp.watch(['./src/css/**/*.css'],['css']);
    gulp.watch(['./src/js/**/*.js'],['js']);
    gulp.watch(['./src/**/*.html'],['html']);
});