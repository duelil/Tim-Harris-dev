const gulp = require("gulp");
const gulpIf = require("gulp-if");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass")(require("sass")); // Opdateret sass integration
const htmlmin = require("gulp-htmlmin");
const cssmin = require("gulp-cssmin");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const concat = require("gulp-concat");
const jsImport = require("gulp-js-import");
const sourcemaps = require("gulp-sourcemaps");
const htmlPartial = require("gulp-html-partial");
const del = require("del"); // Erstat gulp-clean
const isProd = process.env.NODE_ENV === "prod";

const htmlFile = ["src/*.html"];

function html() {
  return gulp
    .src(htmlFile)
    .pipe(
      htmlPartial({
        basePath: "src/partials/",
      })
    )
    .pipe(
      gulpIf(
        isProd,
        htmlmin({
          collapseWhitespace: true,
        })
      )
    )
    .pipe(gulp.dest("docs"));
}

function css() {
  return gulp
    .src("src/sass/style.scss")
    .pipe(gulpIf(!isProd, sourcemaps.init()))
    .pipe(
      sass({
        includePaths: ["node_modules"],
      }).on("error", function(err){
        console.log(err.toString());
        this.emit('end');
      })
    )
    .pipe(gulpIf(!isProd, sourcemaps.write()))
    .pipe(gulpIf(isProd, cssmin()))
    .pipe(gulp.dest("docs/css/"));
}

function js() {
  return gulp
    .src("src/js/*.js")
    .pipe(
      jsImport({
        hideConsole: true,
      })
    )
    .pipe(concat("all.js"))
    .pipe(gulpIf(isProd, uglify()))
    .pipe(gulp.dest("docs/js"));
}

function img() {
  return gulp.src("src/img/*").pipe(gulpIf(isProd, imagemin())).pipe(gulp.dest("docs/img/"));
}

function serve() {
  browserSync.init({
    open: true,
    server: "./docs",
  });
}

function browserSyncReload(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
  gulp.watch("src/**/*.html", gulp.series(html, browserSyncReload));
  gulp.watch("src/**/*.scss", gulp.series(css, browserSyncReload));
  gulp.watch("src/**/*.js", gulp.series(js, browserSyncReload));
  gulp.watch("src/img/**/*.*", gulp.series(img, browserSyncReload)); //Tilføjet browserSyncReload
  return;
}

function cleanDocs() {
  return del(["docs"]);
}

exports.css = css;
exports.html = html;
exports.js = js;
exports.clean = cleanDocs;
exports.serve = gulp.parallel(html, css, js, img, watchFiles, serve);
exports.default = gulp.series(cleanDocs, html, css, js, img);