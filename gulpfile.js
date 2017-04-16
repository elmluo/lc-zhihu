'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var openURL = require('open');
var lazypipe = require('lazypipe');
var rimraf = require('rimraf');
var wiredep = require('wiredep').stream;
var runSequence = require('run-sequence');

/**
 * 关于文件资源路径配置
 */
var root = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
};

// 定义不同文件的路径
var paths = {
    scripts: [root.app + '/scripts/**/*.js'],
    styles: [root.app + '/styles/**/*.css'],
    test: ['test/spec/**/*.js'],
    testRequire: [
        root.app + '/bower_components/angular/angular.js',
        root.app + '/bower_components/angular-mocks/angular-mocks.js',
        root.app + '/bower_components/angular-resource/angular-resource.js',
        root.app + '/bower_components/angular-cookies/angular-cookies.js',
        root.app + '/bower_components/angular-sanitize/angular-sanitize.js',
        root.app + '/bower_components/angular-route/angular-route.js',
        'test/mock/**/*.js',
        'test/spec/**/*.js'
    ],
    karma: 'karma.conf.js',
    views: {
        main: root.app + '/index.html',
        files: [root.app + '/views/**/*.html']
    }
};

// 注入bower下载的静态组件资源
gulp.task('bower', function () {
    return gulp.src(paths.views.main)
        .pipe(wiredep({
            directory: root.app + '/bower_components',
            ignorePath: '..'
        }))
        .pipe(gulp.dest(root.app + '/views'));
});


/**
 * 复用depipe流
 */
var lintScripts = lazypipe()
    .pipe($.jshint, '.jshintrc')
    .pipe($.jshint.reporter, 'jshint-stylish');

var styles = lazypipe()
    .pipe($.autoprefixer, 'last 1 version')
    .pipe(gulp.dest, '.tmp/styles');


/**
 * 定义任务
 */

// 编译css
gulp.task('styles', function () {
    return gulp.src(paths.styles)
        .pipe(styles());
});

// javascript代码检查
gulp.task('lint:scripts', function () {
    return gulp.src(paths.scripts)
        .pipe(lintScripts());
});

// 清空.tmp目录
gulp.task('clean:tmp', function (cb) {
    rimraf('./.tmp', cb);
});

// 打开浏览器
gulp.task('start:client', ['start:server', 'styles'], function () {
    openURL('http://localhost:9000');
});

// root.app目录和.tmp目录下开启服务器
gulp.task('start:server', function () {
    $.connect.server({
        root: [root.app, '.tmp'],
        livereload: true,
        port: 9000  // 改变为ip地址“0.0.0.0”的形式，可以从外部访问服务器
    });
});

// text、app、.temp目录下开启服务器
gulp.task('start:server:test', function () {
    $.connect.server({
        root: ['test', root.app, '.tmp'],
        livereload: true, //是否实现热加载
        port: 9001
    });
});

// 文件改动监听，实现浏览器自动刷新器
gulp.task('watch', function () {
    $.watch(paths.styles)
        .pipe($.plumber())
        .pipe(styles())
        .pipe($.connect.reload());

    $.watch(paths.views.files)
        .pipe($.plumber())
        .pipe($.connect.reload());

    $.watch(paths.views.main)
        .pipe($.plumber())
        .pipe($.connect.reload());

    $.watch(paths.scripts)
        .pipe($.plumber())
        .pipe(lintScripts())
        .pipe($.connect.reload());

    $.watch(paths.test)
        .pipe($.plumber())
        .pipe(lintScripts());

    gulp.watch('bower.json', ['bower']);
});

// 组合任务：开发环境
gulp.task('serve', function (cb) {
    runSequence('clean:tmp',
        ['lint:scripts'],
        ['start:client'],
        'watch', cb);
});

// 组合任务：生产环境
gulp.task('serve:prod', function () {
    $.connect.server({
        root: [root.dist],
        livereload: true,
        port: 9000
    });
});

// 组合任务：测试环境
gulp.task('test', ['start:server:test'], function () {
    var testToFiles = paths.testRequire.concat(paths.scripts, paths.test);
    return gulp.src(testToFiles)
        .pipe($.karma({
            configFile: paths.karma,
            action: 'watch'
        }));
});


/**
 * build：打包压缩构建
 */
// 清空dist文件夹
gulp.task('clean:dist', function (cb) {
    rimraf('./dist', cb);
});

// 过滤、压缩、混淆、版本号
gulp.task('client:build', ['html', 'styles'], function () {

    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src(paths.views.main)
        .pipe($.useref({searchPath: [root.app, '.tmp']}))
        .pipe(jsFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe(jsFilter.restore())

        .pipe(cssFilter)
        .pipe($.minifyCss({cache: true}))
        .pipe(cssFilter.restore())

        .pipe($.rev())
        .pipe($.revReplace())
        .pipe(gulp.dest(root.dist));
});

// 复制html文件资源到指定目录
gulp.task('html', function () {
    return gulp.src(root.app + '/views/**/*')
        .pipe(gulp.dest(root.dist + '/views'));
});

// 复制图片资源到指定目录
gulp.task('images', function () {
    return gulp.src(root.app + '/images/**/*')
        .pipe($.cache($.imagemin({  //图片压缩
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(root.dist + '/images'));
});

// 复制其他的文件资源
gulp.task('copy:extras', function () {
    return gulp.src(root.app + '/*/.*', {dot: true})
        .pipe(gulp.dest(root.dist));
});

// 复制文字到指定目录
gulp.task('copy:fonts', function () {
    return gulp.src(root.app + '/fonts/**/*')
        .pipe(gulp.dest(root.dist + '/fonts'));
});

// 复制、
gulp.task('build', ['clean:dist'], function () {
    runSequence(['images', 'copy:extras', 'copy:fonts', 'client:build']);
});

// 指定直接命令行输入gulp，运行的默认任务
gulp.task('default', ['build']);
