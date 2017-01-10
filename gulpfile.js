/**
 * pro Gulpfile
 * Author:Lurker
 * 2017/1/5 11:42
 */

// nodejs -->

// npm install -g minimatch
// npm install cnpm -g --registry=https://registry.npm.taobao.org
// cnpm install gulp -g

// 进入项目文件
// 执行命令 cnpm init 来新建package.json

// 导入包
var gulp = require('gulp'),                             // gulp                                 cnpm install gulp --save-dev
    cssver = require('gulp-make-css-url-version'),      // 给css文件里引用url加版本号             cnpm install gulp-make-css-url-version --save-dev
    cssmin = require('gulp-clean-css'),                 // css压缩                               cnpm install gulp-clean-css --save-dev
    postcss = require('gulp-postcss'),                  // css兼容                               cnpm install gulp-postcss --save-dev
    less = require('gulp-less'),                        // less编译                              cnpm install gulp-less --save-dev
    sass = require('gulp-sass'),                        // sass编译                              cnpm install gulp-sass --save-dev
    imagemin = require('gulp-imagemin'),                // 图片压缩                              cnpm install gulp-imagemin --save-dev
    cache = require('gulp-cache'),                      // 缓存                                  cnpm install gulp-cache --save-dev
    uglify = require('gulp-uglify'),                    // js压缩                                cnpm install gulp-uglify --save-dev
    rename = require('gulp-rename'),                    // 重命名                                cnpm install gulp-rename --save-dev
    autoprefixer = require('gulp-autoprefixer'),        // 自动处理浏览器前缀                     cnpm install gulp-autoprefixer --save-dev
    concat = require('gulp-concat'),                    // 文件合并                              cnpm install gulp-concat --save-dev
    contentIncluder = require('gulp-content-includer'), // 模块合并                              cnpm install gulp-content-includer --save-dev
    fileinclude = require('gulp-file-include'),         // 文件引用                              cnpm install gulp-file-include --save-dev
    copy = require('gulp-file-copy'),                   // 文件复制                              cnpm install gulp-file-copy --save-dev
    changed = require('gulp-changed'),                  // 文件监听是否被改变                     cnpm install gulp-changed --save-dev
    debug = require('gulp-debug'),                      // 调试                                  cnpm install --save-dev gulp-debug
    del = require('del'),                               // 文件清理                              cnpm install del --save-dev
    pngquant = require('imagemin-pngquant'),            // PNG压缩                               cnpm install imagemin-pngquant --save-dev
    runSequence = require('run-sequence'),              // 多任务                                cnpm install run-sequence --save-dev
    browserSync = require('browser-sync');              // 浏览器                                cnpm install browser-sync --save-dev

var argv = require('yargs').argv;                       // 获取启动参数                          cnpm install yargs --save-dev

// 启动本地静态代理服务器
// browser-sync start --server --files "build/css/*.css, build/js/*.js, *.html, **/*.html"

// https://www.npmjs.com/package  npm 包查询
// http://npm.taobao.org/ 淘宝npm镜像

// 项目开发配置
var _dev = {
    pkg: 'pro',
    version: '1.0',
    meta: {                             //                                                     /
        devPath: 'build/',              // 开发路径                                             build/
        outPath: 'dist/',               // 输出路径                                             dist/
        imgPath: 'img/',                // 图片路径（相当于开发|输出路径）                        build/img/ | dist/img/
        htmlPath: '_page/',             // html开发路径                                         _page/
        pagePath: 'page/',               // html输出路径                                        page/
        lessPath: 'less/',              // less路径                                             build/less/
        sassPath: 'sass/',              // scss路径                                             build/sass/
        cssPath: 'css/',                // css路径（相对于输出路径）                              build/css/ | dist/css/
        jsPath: 'js/',                  // js路径（相对于开发|输出路径）                          build/js/  | dist/css/
        libPath: 'lib/'                 // 项目中使用到的库（相对于开发|输出路径）                 build/lib/ | dist/lib/
    },
    devSuffix:'_',                      // 开发后缀
    outSuffix:'.min',                   // 输出后缀
    except:['require' ,'exports' ,'module' ,'$', 'mui','Vue','VueMaterial'],    // 排除混淆关键字
    browsers:['> 1%','last 5 versions', 'Android >= 4.0','ios 7'],              // 浏览器兼容性
    includerReg: /<!\-\-import\s+"([^"]+)"\-\->/g,                              // html模块合并正则
    jsincluderReg: /\/\/\-\-include\s+"([^"]+)"\-\-\/\//g,                      // js模块合并正则
    fileinclude:{                       // html文件合并
        prefix: '@@',                   // 变量前缀
        suffix: ''                      // 变量后缀
    },
    jsfileinclude:{                     // js文件合并
        prefix: '//{{',                 // 变量前缀
        suffix: '}}'                    // 变量后缀
    }
};

// 自动构建配置
var _config = {
    clean: [_dev.meta.outPath,_dev.meta.pagePath,                   // 清除该路径下的所有文件
            _dev.meta.devPath+_dev.meta.jsPath+_dev.meta.outPath    // js编译未压缩文件夹
    ],
    concatjs: [                                                 // 需要合并的模块
        {
            fileName: 'fileName',                               // 合并之后的文件名称
            outPath: _dev.meta.devPath + _dev.meta.jsPath,      // 文件输出路径
            minPath: _dev.meta.outPath + _dev.meta.jsPath,      // 压缩文件输出路径
            filePath: []                                        // 待合并的文件
        },
    ],

    concathtml:[                                                    // html模版合并
        {
            filePath: _dev.meta.htmlPath,                           // html模版文件路径
            fileName: '**/*.html',                                  // 待处理的html文件
            outPath: _dev.meta.pagePath,                            // 处理之后的文件输出路径
            abandon: _dev.devSuffix + '*.html',                     // 不处理的文件
            rename: {}                                              // 重命名
        },
        {
            filePath: './',
            fileName: 'index.dev.html',
            outPath: './',
            abandon: _dev.devSuffix + '*.html',
            rename: {                                     // rename
                basename: 'index',                        // 文件名
                suffix: ''                                // 追加后缀
            }
        }
    ],

    copy: [                                                     // 文件复制配置（不同的路径需要配置不同的对象）
        {                                                       // copy webapp/lib -> build/lib
            filePath:_dev.meta.devPath + _dev.meta.libPath,     // 待复制路径
            outPath:_dev.meta.outPath + _dev.meta.libPath,      // 目标路径
            fileName:'*.js'                                     // 文件
        },
        {                                                       // 字体文件
            filePath:_dev.meta.devPath + 'fonts/',
            outPath:_dev.meta.outPath + 'fonts/',
            fileName:'*.{ttf,eof,svg,woff}'
        },
        {                                                       // json文件
            filePath:_dev.meta.devPath + 'json/',
            outPath:_dev.meta.outPath + 'json/',
            fileName:'*.json'
        }
    ],

    jshint: {                                                   // js代码检测
        filePath: _dev.meta.devPath + _dev.meta.jsPath,         // js检测文件路径
        fileName: argv.jshint || '*.js',                        // js检测文件名 (可通过命令指定js文件)
    },

    sass: {                                                     // sass任务相关配置
        filePath: _dev.meta.devPath + _dev.meta.sassPath,       // 待处理文件路径
        fileName: 'mui.scss',                                   // 待处理文件名
        outPath: _dev.meta.outPath + _dev.meta.cssPath,         // 处理之后输出文件的路径
        abandon: _dev.devSuffix + '*.scss'                      // 不处理的文件
    },

    less: {
        filePath: _dev.meta.devPath + _dev.meta.lessPath,
        fileName: '*.less',
        outPath: _dev.meta.outPath + _dev.meta.cssPath,
        abandon: _dev.devSuffix + '*.less'
    },

    css: {
        filePath: _dev.meta.devPath + _dev.meta.cssPath,
        fileName: '*.css',
        outPath: _dev.meta.outPath + _dev.meta.cssPath,
        abandon: _dev.devSuffix + '*.css'
    },

    img: {
        filePath: _dev.meta.devPath + _dev.meta.imgPath,
        fileName: '*.{png,jpg,gif,ico}',
        outPath: _dev.meta.outPath + _dev.meta.imgPath
    },

    js: {
        filePath: _dev.meta.devPath + _dev.meta.jsPath,
        fileName: '*.js',
        outPath: _dev.meta.outPath + _dev.meta.jsPath,
        abandon: _dev.devSuffix + '*.js'
    }
};

var _watch = [                                              // 代理服务器监听文件变化实时更新页面
    _config.css.outPath + _config.css.fileName,             // js文件
    _config.js.outPath + _config.js.fileName                // css文件
];

// es6
_config.concathtml.map(item => _watch.push(item.outPath + item.fileName)); // html文件

/*------------------------------- 处理 --------------------------------*/
// 文件复制
gulp.task('copy',function(){
    // ES6
    return _config.copy.map(item => gulp.src(item.filePath + item.fileName)
       .pipe(changed(item.outPath))
       .pipe(debug({title:'正在复制文件：'}))
       .pipe(gulp.dest(item.outPath))
    );
})

// 图片压缩（只压缩修改的图片，没有修改的图片直接从缓存文件读取）
gulp.task('imgmin', function() {
    return gulp.src([_config.img.filePath + '**/' + _config.img.fileName,_config.img.filePath + _config.img.fileName])
        .pipe(changed(_config.img.outPath))
        .pipe(debug({title:'正在进行图片压缩：'}))
        .pipe(cache(imagemin({
            // progressive: true,
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        })))
        .pipe(gulp.dest(_config.img.outPath));
});

// less 任务
gulp.task('less',function(){
    return gulp.src([_config.less.filePath + _config.less.fileName, '!' + _config.less.filePath + _config.less.abandon]) // 获取任务需要的文件
        .pipe(changed(_config.less.outPath,{extension:_dev.outSuffix + '.css'}))  // .min.css  检测目标文件是否发生变化
        .pipe(debug({title:'正在编译less：'}))
        .pipe(less()) // 该任务调用的模块
        .pipe(rename({suffix: _dev.outSuffix}))              //rename压缩后的文件名     https://www.npmjs.com/package/gulp-rename
        .pipe(cssver()) // 给css文件里引用文件加版本号（文件MD5）
//      .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')) // http://browserl.ist/
//      .pipe(autoprefixer({browsers:['last 2 version', '>1%', 'ie 6-8','safari 5', 'opera 12.1', 'ios 6', 'android 4']})) // https://github.com/ai/browserslist#queries
        .pipe(autoprefixer({
            browsers:_dev.browsers,
            cascade: true,
            //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:false //是否去掉不必要的前缀 默认：true
        })) // https://github.com/ai/browserslist#queries
//      .pipe(postcss())
//      .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }), cssnext() ])) // https://github.com/MoOx/postcss-cssnext
//      .pipe(postcss([cssnext()]))             // http://cssnext.io/features/
        .pipe(cssmin({
            advanced: true, //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: '', //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: false, //类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*' //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        .pipe(gulp.dest(_config.less.outPath)); // 编译之后的css文件存放位置
});

// sass 任务
gulp.task('scss',function(){
    return gulp.src([_config.sass.filePath + _config.sass.fileName, '!' + _config.sass.filePath + _config.sass.abandon]) // 获取任务需要的文件
        .pipe(changed(_config.sass.outPath,{extension:_dev.outSuffix + '.css'})) // .min.css 检测目标文件是否发送变化
        .pipe(debug({title:'正在编译sass：'}))
        .pipe(sass()) // 该任务调用的模块
        .pipe(rename({suffix: _dev.outSuffix}))              //rename压缩后的文件名
        .pipe(cssver()) // 给css文件里引用文件加版本号（文件MD5）
//      .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')) // https://github.com/ai/browserslist#queries
        .pipe(autoprefixer({browsers:_dev.browsers})) // https://github.com/ai/browserslist#queries
        .pipe(cssmin({
            advanced: true, //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: '', //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: false, //类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*' //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        .pipe(gulp.dest(_config.sass.outPath)); // 编译之后的css文件存放位置
});

// css压缩
gulp.task('cssmin', function () {
    return gulp.src([_config.css.filePath + _config.css.fileName, '!' + _config.css.filePath + _config.css.abandon])
        .pipe(changed(_config.css.outPath,{extension:_dev.outSuffix + '.css'})) // .min.css 检测目标文件是否发送变化
        .pipe(debug({title:'正在压缩css：'}))
        .pipe( cssver() )                            //给css文件里引用文件加版本号（文件MD5）
        .pipe(rename({suffix: _dev.outSuffix}))              //rename压缩后的文件名
        .pipe( cssmin(
            {
                advanced: true,         //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
                compatibility: '',      //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
                keepBreaks: false,       //类型：Boolean 默认：false [是否保留换行]
                keepSpecialComments: '*'//保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
            }
        ) )
        .pipe( gulp.dest(_config.css.outPath) );
});

// js压缩
gulp.task('jsmin', function() {
    return gulp.src([_config.js.filePath + _config.js.fileName, '!' + _config.js.filePath + _config.js.abandon])
        .pipe(changed(_config.js.outPath,{extension:_dev.outSuffix + '.js'})) // .min.js 检测目标文件是否发送变化
        .pipe(debug({title:'正在压缩js：'}))
        // 模块合并
        .pipe(contentIncluder({
            includerReg: _dev.jsincluderReg              // //--import "./path/fileName.js"--//
        }))
        // 文件合并
        .pipe(fileinclude({
            prefix:_dev.jsfileinclude.prefix,           // 变量前缀
            suffix:_dev.jsfileinclude.suffix,           // 变量后缀
            context:{}                                  // 全局变量配置
        }))
        .pipe(gulp.dest(_config.js.filePath + _dev.meta.outPath))         // 输出到文件夹
        .pipe(rename({                                // rename压缩后的文件名
            suffix: _dev.outSuffix                    // 追加后缀
        }))
        .pipe(uglify(                       //压缩
            {
                mangle: true,                   //类型：Boolean 默认：true 是否修改变量名
                compress: true,                 //类型：Boolean 默认：true 是否完全压缩
                preserveComments: 'license',    //保留所有注释 'all|license|function|some'
                mangle: {
                        except: _dev.except    //排除混淆关键字
                    }
            }
        ))
        .pipe(gulp.dest(_config.js.outPath))         //输出到文件夹
});

// js合并
gulp.task('concatjs',function(){
    // ES6
    return _config.concatjs.map(item => gulp.src(item.filePath)
        .pipe(changed(_config.js.outPath,{extension:_dev.outSuffix + '.js'})) // .min.js 检测目标文件是否发送变化
        .pipe(debug({title:'正在合并js：'}))
        .pipe( concat( item.fileName + '.js' ) )
        // 模块合并
        .pipe(contentIncluder({
            includerReg: _dev.jsincluderReg              // //--import "./tpl/header.tpl.js"--//
        }))
        // 文件合并
        .pipe(fileinclude({
            prefix:_dev.jsfileinclude.prefix,               // 变量前缀
            suffix:_dev.jsfileinclude.suffix,               // 变量后缀
            context:{}                                      // 全局变量配置
        }))
        .pipe(gulp.dest(_config.js.filePath + _dev.meta.outPath))         // 输出到文件夹
        .pipe(rename({                                // rename压缩后的文件名
            basename: item.fileName,                  // 文件名
            suffix: _dev.outSuffix                    // 追加后缀
        }))
        .pipe(uglify(                       //压缩
            {
                mangle: true,                   //类型：Boolean 默认：true 是否修改变量名
                compress: true,                 //类型：Boolean 默认：true 是否完全压缩
                preserveComments: 'license',    //保留所有注释 'all|license|function|some'
                mangle: {
                        except: _dev.except    //排除混淆关键字
                    }
            }
        ))
        .pipe(gulp.dest(_config.js.outPath))        //输出
    )
});

// js代码检测
gulp.task('jshint', function() {
    return gulp.src(_config.jshint.filePath + _config.jshint.fileName) // 检查文件：js目录下所有的js文件
        .pipe(debug({title:'正在检测js语法：'}))
        .pipe(jshint({
                options:{
                    "asi":true,       // 如果是真，JSHint会无视没有加分号的行尾，自动补全分号一直是Javascript很有争议的一个语法特性
                    "boss":true,      // 很霸气的选项，如果为真，那么JSHint会允许在if，for，while里面编写赋值语句
                    "curly":true,     // 如果为真，JSHint会要求你在使用if和while等结构语句时加上{}来明确代码块。
                    "maxerr":5,       // 设定错误的阈值，超过这个阈值jshint不再向下检查，提示错误太多。
                    "newcap":true,    // 如果为真，JSHint会要求每一个构造函数名都要大写字母开头
                    "noarg":true,     // 如果为真，JSHint会禁止arguments.caller和arguments.callee的使用arguments对象是一个类数组的对象，它具有一个索引值
                    "noempty":true,   // 没有把构造器的结果赋值给变量
                    "nomen":false,    // 如果为真，JSHint会禁用下划线的变量名。很多人使用_name的方式来命名他们的变量，以说明这是一个私有变量，但实际上，并不是，下划线只是做了一个标识。如果要使用私有变量，可以使用闭包来实现。
                    "onevar":true,    // 如果为真，JSHint期望函数只被var的形式声明一遍。
                    "passfail":true,  // 如果为真，JSHint会在发现首个错误后停止检查。
                    "plusplus":false, // 如果为真，JSHint会禁用自增运算和自减运算++和--可能会带来一些代码的阅读上的困惑。
                    "undef":true,     // 如果为真，JSHint会要求所有的非全局变量
                    "sub":true,       // 如果为真，JSHint会允许各种形式的下标来访问对象
                    "strict":false,    // 如果为真，JSHint会要求你使用use strict;语法
                    "browser": true   // 浏览器环境下执行
                },
                globals: {
                    $: false,
                    jQuery: false
                }
        })) // 进行检查
        .pipe(jshint.reporter('default')) // 对代码进行报错提示
});

// Html模版合并
gulp.task('concathtml', function() {
    return _config.concathtml.map(item =>
        gulp.src([item.filePath + item.fileName, '!' + item.filePath + item.abandon])
        .pipe(changed(item.outPath,{extension:'.html'})) // .html 检测目标文件是否发送变化
        .pipe(debug({title:'正在合并html：'}))
        // 模块合并
        .pipe(contentIncluder({
            includerReg: _dev.includerReg              // <!--import "./tpl/header.tpl.html"-->
        }))
        // 文件合并
        .pipe(fileinclude({
            prefix:_dev.fileinclude.prefix,             // 变量前缀
            suffix:_dev.fileinclude.suffix,             // 变量后缀
            context:{                                   // 全局变量
                jsSrc: _config.js.outPath,              // js输出路径
                imgSrc: _config.img.outPath,            // img输出路径
                cssSrc: _config.css.outPath             // css输出路径
            }
        }))
        .pipe( rename(item.rename) )
        .pipe(gulp.dest(item.outPath))
    )
});

/*--------------------------- 删除 ------------------------------------*/

// 文件删除
gulp.task('clean', function(cb) {
    return del(_config.clean, cb)
});

// js文件删除
gulp.task('cleanjs', function(cb) {
    return del(_config.js.outPath + _config.js.fileName, cb)
});

// css文件删除
gulp.task('cleancss', function(cb) {
    return del(_config.css.outPath + _config.css.fileName, cb)
});

// img文件删除
gulp.task('cleanimg', function(cb) {
    return del(_config.img.outPath + _config.img.fileName, cb)
});

// html文件删除
gulp.task('cleanhtml', function(cb) {
    return del(_config.html.outPath, cb)
});

/*------------------------------- 监听 ----------------------------------------*/
// js文件监听
gulp.task('watchjs',function(){
    // 监听js文件变化自动执行cleanjs和jsmin
    return gulp.watch(_config.js.filePath + _config.js.fileName,['jsmin']);
});

// img文件监听
gulp.task('watchimg',function(){
    // 监听img文件变化自动执行imgmin
    return gulp.watch(_config.img.filePath + _config.img.fileName,['imgmin']);
});

// css文件监听
gulp.task('watchcss',function(){
    // 监听img文件变化自动执行imgmin
    return gulp.watch(_config.js.filePath + _config.js.fileName,['cssmin']);
});

// html文件监听
gulp.task('watchhtml',function(){
    // 监听html文件变化自动执行concathtml
    return _config.concathtml.map(item => gulp.watch(item.filePath + item.fileName,['concathtml']))
});

// less文件监听
gulp.task('watchless',function(){
    // 监听less文件变化自动执行less
    return gulp.watch(_config.less.filePath + _config.less.fileName,['less']);
});

// less文件监听
gulp.task('watchscss',function(){
    // 监听sass文件变化自动执行less
    return gulp.watch(_config.sass.filePath + _config.sass.fileName,['scss']);
});

/*-------------------------------- 自动化 ---------------------------------*/
// 打包
gulp.task('build',function(callback){
    // 依次按顺序完成任务
    runSequence('clean','copy','cssmin','jsmin','concatjs',['less','scss'],'concathtml',callback);
    // 从左到右依次运行，当任务完成之后才运行下一个任务，[]的任务是同时运行的
});

// 监听
gulp.task('watch',function(callback){
    runSequence('watchjs','watchimg','watchcss','watchless','watchscss','watchhtml',callback);
});

// 运行
gulp.task('run',function(){
   browserSync({
       server: {
           baseDir: "./"
       }
   });
    return gulp.watch(_watch,{readDelay:300}).on('change', browserSync.reload);
})

// 默认任务：打包->监听->运行
gulp.task('default',function(callback){
    runSequence('build','watch','run',callback);
});
