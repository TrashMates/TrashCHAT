// TM-Website/gulpfile.js
// VERSION 2.00
// TiCubius <trashmates@protonmail.com>

const gulp = require("gulp")
const pump = require("pump")
const plugins = require("gulp-load-plugins")()

const pug = require("gulp-pug")
const watch = require('gulp-watch')
const gulp_watch_pug = require('gulp-watch-pug')

var source = "src"
var destination = "dist"

// GULP:TASKS
// > CSS FILES

gulp.task("clean-css", (cb) => {
	pump([
		gulp.src(destination + "/assets/css/**/*.css"),

		plugins.clean()
	], cb)
})

gulp.task("compile-css", ["clean-css"], (cb) => {
	pump([
		gulp.src(source + "/assets/sass/**/*.*"),

		plugins.sass(),
		plugins.csscomb(),
		plugins.cssbeautify({
			indent: "	"
		}),
		plugins.autoprefixer(),

		gulp.dest(destination + "/assets/css/")
	], cb)
})

gulp.task("minify-css", ["compile-css"], (cb) => {
	pump([
		gulp.src(destination + "/assets/css/**/*.css"),

		plugins.csso(),
		plugins.rename({
			suffix: ".min"
		}),

		gulp.dest(destination + "/assets/css/")
	], cb)
})

// GULP:TASKS
// > JS-LIB-FILES

gulp.task("clean-js-lib", (cb) => {
	pump([
		gulp.src(destination + "/js/lib/**/*.js"),

		plugins.clean()
	], cb)
})

gulp.task("minify-js-lib", ["clean-js-lib"], (cb) => {
	pump([
		// Minify source files. (lib not modified)
		gulp.src(source + "/assets/js/lib/**/*.js"),

		plugins.uglify(),
		plugins.rename({
			suffix: ".min"
		}),

		gulp.dest(destination + "/assets/js/lib/")
	], cb)
})


// GULP:TASKS
// > JS-FILES

gulp.task("clean-js", (cb) => {
	pump([
		gulp.src(destination + "/assets/js/*.js"),

		plugins.clean()
	], cb)
})

gulp.task("compile-js", ["clean-js"], (cb) => {
	pump([
		gulp.src(source + "/assets/js/*.js"),

		plugins.babel({
			presets: ["env"],
			compact: false
		}),

		gulp.dest(destination + "/assets/js/")
	], cb)
})

gulp.task("minify-js", ["compile-js"], (cb) => {
	pump([
		// Minify compiled files. (modified)
		gulp.src(destination + "/assets/js/*.js"),

		plugins.uglify(),
		plugins.rename({
			suffix: ".min"
		}),

		gulp.dest(destination + "/assets/js/")
	], cb)
})


// GULP:TASKS
// > IMAGE OPTIMIZE
gulp.task("optimize-images", (cb) => {
	pump([
		gulp.src(source + "/assets/images/**"),

		plugins.imagemin({
			progressive: true,
			interlaced: true
		}),

		gulp.dest(destination + "/assets/images/")
	])
})


// GULP:TASKS
// > FONTS COPY
gulp.task("copy-fonts", (cb) => {
	pump([
		gulp.src(source + "/assets/fonts/*"),
		gulp.dest(destination + "/assets/fonts/")
	])
})

// GULP:TASKS
// > CONFIG COPY
gulp.task("copy-config", (cb) => {
	gulp.src(source + "/assets/*.json")
	.pipe(gulp.dest(destination + "/assets/"))
})

// GULP::TASKS
// > HTML JADE
gulp.task("template-pug", (cb) => {
	pump([
		gulp.src(source + "/*.pug"),

		plugins.clean(),
		plugins.pug({
			verbose: true,
			cache: false
		}),

		gulp.dest(destination)
	])
})

// TASKS:GULP
gulp.task("watch", () => {
	gulp.watch(source + "/assets/sass/**/**/*.sass", ["minify-css"])

	gulp.watch(source + "/assets/fonts/*.*", ["copy-fonts"])
	gulp.watch(source + "/assets/*.json", ["copy-config"])

	gulp.watch(source + "/assets/images/**/*", ["optimize-images"])

	gulp.watch(source + "/assets/js/lib/*.js", ["minify-js-lib"])
	gulp.watch(source + "/assets/js/api/*.js", ["minify-js-api"])
	gulp.watch(source + "/assets/js/*.js", ["minify-js"])

})

gulp.src(source + "/*.pug")
	.pipe(watch(source + "/*.pug"))
	.pipe(gulp_watch_pug(source + "/*.pug", {
		delay: 100
	}))
	.pipe(pug({
		pretty: true
	}))
	.pipe(gulp.dest(destination))

gulp.task("default", ["watch", "optimize-images"])
gulp.task("build", ["optimize-images", "copy-fonts", "copy-config", "minify-js-lib", "minify-js", "minify-css"])
