'use strict';

const gulp = require('gulp'),
      scss = require('gulp-sass'),
      autoprefixer = require('gulp-autoprefixer'),
      browserSync = require('browser-sync').create(),
      concat = require('gulp-concat'),
      babel = require('gulp-babel'),
      uglify = require('gulp-uglify'),
      rename = require('gulp-rename'),
      del = require('del'),
      merge = require('merge2'),
      cleanCSS = require('gulp-clean-css');

// Compila Sass e joga nas pastas dev e prod
function compilaSass () {
  const dev = gulp
    .src('src/scss/**/*.scss') 
    .pipe(scss({ outputStyle: 'expanded' }).on('error', scss.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gulp.dest('dist/dev/css'))
    .pipe(browserSync.stream());
  
  const prod = gulp
    .src('src/scss/**/*.scss') //Caminho scss
    .pipe(scss({ outputStyle: 'compressed' }).on('error', scss.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/prod/css'))
    .pipe(browserSync.stream());
    
  return merge(dev, prod)
}
gulp.task('compilaSass', compilaSass);

// Copia os arquivos (css, font, icon e img) para as pastas dev e prod
function copiaArquivos () {
  const copiaCss = gulp.src('src/css/**.*')
    .pipe(gulp.dest('dist/dev/css'))
    .pipe(gulp.dest('dist/prod/css'));

  const copiaFonts = gulp.src('src/fonts/**.*')
    .pipe(gulp.dest('dist/dev/fonts'))
    .pipe(gulp.dest('dist/prod/fonts'));
  
  const copiaIcons = gulp.src('src/icons/**.*')
    .pipe(gulp.dest('dist/dev/icons'))
    .pipe(gulp.dest('dist/prod/icons'));

  const copiaImages = gulp.src('src/images/**.*')
    .pipe(gulp.dest('dist/dev/images'))
    .pipe(gulp.dest('dist/prod/images'));

  return merge(copiaCss, copiaFonts, copiaIcons, copiaImages)
}
gulp.task('copiaArquivos', copiaArquivos);

// Pega os css's da dist, concatena e coloca em um unico arquivo
function concatCss () {
  const concatenaDev = gulp
    .src('dist/dev/css/**.*')
    .pipe(concat('style.css'))
    .pipe(gulp.dest('dist/dev/css/'))

  const concatenaProd = gulp
    .src('dist/prod/css/**.*')
    .pipe(cleanCSS({compatibility: 'ie9'}))
    .pipe(concat('style.css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/prod/css/'));

  return merge(concatenaDev, concatenaProd);
}
gulp.task('concatCss', concatCss)

// Função para juntar o JS, (concatena, faz o babel e uglify)
function gulpJS () {
  return gulp
    .src('src/js/**/*.js')
    .pipe(concat('main.js'))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulp.dest('dist/dev/js'))
    .pipe(uglify({compress: true, mangle: {toplevel: true}}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/prod/js'))
    .pipe(browserSync.stream())
}
gulp.task('js', gulpJS);

// Função para criar a distribuição
function criaDiretorios () {
  return gulp.src('*.*', {read: false})
    // dev
    .pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./dist/dev'))
    .pipe(gulp.dest('./dist/dev/css'))
    .pipe(gulp.dest('./dist/dev/js'))
    .pipe(gulp.dest('./dist/dev/fonts'))
    .pipe(gulp.dest('./dist/dev/icons'))
    .pipe(gulp.dest('./dist/dev/images'))
    // prod
    .pipe(gulp.dest('./dist/prod'))
    .pipe(gulp.dest('./dist/prod/css'))
    .pipe(gulp.dest('./dist/prod/js'))
    .pipe(gulp.dest('./dist/prod/fonts'))
    .pipe(gulp.dest('./dist/prod/icons'))
    .pipe(gulp.dest('./dist/prod/images'))
}
gulp.task('criaDiretorios', criaDiretorios);

// Função para iniciar o browser
function browser() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
}
gulp.task('browser-sync', browser);

// Apaga a pasta dist
function apagaDist () {
  return del('./dist', {force:true});
}
gulp.task('apagaDist', apagaDist);

// Limpa css concatenado da dist pasta dev 
function limpaCssConcatDev () {
  return del(['dist/dev/css/*.css', '!dist/dev/css/style.css'], {force:true});
}
gulp.task('limpaCssConcatDev', limpaCssConcatDev);

// Limpa css concatenado da dist pasta prod
function limpaCssConcatProd () {
  return del(['dist/prod/css/*.css', '!dist/prod/css/style.min.css'], {force:true});
}
gulp.task('limpaCssConcatProd', limpaCssConcatProd);

// Limpa css após concatenar, deixando apenas um arquivo concatenando todo os css
gulp.task('limpaCssConcat', gulp.series('limpaCssConcatDev', 'limpaCssConcatProd'));

// Função de watch do Gulp
function watch() {
  gulp.watch(['./src/scss/**/*.scss']).on('change', gulp.series('build', browserSync.reload));
  gulp.watch('./src/js/**/*.js', gulpJS);
  gulp.watch(['*.html']).on('change', browserSync.reload);
}
gulp.task('watch', watch);

// Tarefa padrão do Gulp, que inicia o watch e o browser-sync
gulp.task('build', gulp.series('apagaDist', 'criaDiretorios', 'compilaSass', 'js', 'copiaArquivos', 'concatCss', 'limpaCssConcat'));
gulp.task('default', gulp.parallel('browser-sync', 'watch'));