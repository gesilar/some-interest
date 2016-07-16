//导入工具包
var gulp = require('gulp'), //本地安装gulp所用到的地方
    less = require('gulp-less');
    uglify=require('gulp-uglify');
 


gulp.task('jsmin',function(){
    gulp.src('src/js/index.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
})
 
gulp.task('default',['testLess', 'elseTask']); //定义默认任务 elseTask为其他任务，该示例没有定义elseTask任务
 
//gulp.task(name[, deps], fn) 定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
//gulp.src(globs[, options]) 执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组) 
//gulp.dest(path[, options]) 处理完后文件生成路径e
